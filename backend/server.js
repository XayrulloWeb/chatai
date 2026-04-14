import { createServer } from "node:http";
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStore } from "./store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

loadEnvIfExists(path.join(projectRoot, ".env"));
loadEnvIfExists(path.join(__dirname, ".env"));

const PORT = Number(process.env.AUTH_PORT || process.env.PORT || 4000);
const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || "change-this-secret-in-production";
const TOKEN_TTL_SECONDS = Number(process.env.AUTH_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 7);

const store = await createStore();

const server = createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    if (req.url === "/health" && req.method === "GET") {
      return sendJson(res, 200, { ok: true, storage: store.kind });
    }

    if (req.url === "/api/auth/register" && req.method === "POST") {
      const body = await getJsonBody(req, res);
      if (!body) return;

      const name = String(body.name || "").trim();
      const email = normalizeEmail(body.email);
      const password = String(body.password || "");

      if (!isValidEmail(email)) {
        return sendJson(res, 400, { message: "Email is not valid." });
      }

      if (password.length < 6) {
        return sendJson(res, 400, { message: "Password must be at least 6 characters." });
      }

      const existingUser = await store.findUserByEmail(email);
      if (existingUser) {
        return sendJson(res, 409, { message: "User already exists." });
      }

      const newUser = {
        id: randomUUID(),
        name,
        email,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      };

      try {
        await store.createUser(newUser);
      } catch (error) {
        if (isUniqueViolation(error)) {
          return sendJson(res, 409, { message: "User already exists." });
        }
        throw error;
      }

      const token = createToken({
        sub: newUser.id,
        email: newUser.email,
      });

      return sendJson(res, 201, {
        token,
        user: publicUser(newUser),
      });
    }

    if (req.url === "/api/auth/login" && req.method === "POST") {
      const body = await getJsonBody(req, res);
      if (!body) return;

      const email = normalizeEmail(body.email);
      const password = String(body.password || "");

      const user = await store.findUserByEmail(email);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return sendJson(res, 401, { message: "Email or password is incorrect." });
      }

      const token = createToken({
        sub: user.id,
        email: user.email,
      });

      return sendJson(res, 200, {
        token,
        user: publicUser(user),
      });
    }

    if (req.url === "/api/auth/me" && req.method === "GET") {
      const auth = await getAuthenticatedUser(req);
      if (!auth.ok) {
        return sendJson(res, 401, { message: auth.message });
      }

      return sendJson(res, 200, {
        user: publicUser(auth.user),
      });
    }

    if (req.url === "/api/chat/messages" && req.method === "GET") {
      const auth = await getAuthenticatedUser(req);
      if (!auth.ok) {
        return sendJson(res, 401, { message: auth.message });
      }

      const messages = await store.getChatMessages(auth.user.id);
      return sendJson(res, 200, { messages });
    }

    if (req.url === "/api/chat/messages" && req.method === "PUT") {
      const auth = await getAuthenticatedUser(req);
      if (!auth.ok) {
        return sendJson(res, 401, { message: auth.message });
      }

      const body = await getJsonBody(req, res);
      if (!body) return;

      if (!Array.isArray(body.messages)) {
        return sendJson(res, 400, { message: "messages must be an array." });
      }

      const nextMessages = sanitizeChatMessages(body.messages);
      const savedMessages = await store.setChatMessages(auth.user.id, nextMessages);

      return sendJson(res, 200, {
        ok: true,
        messages: savedMessages,
      });
    }

    return sendJson(res, 404, { message: "Route not found." });
  } catch (error) {
    console.error("Unhandled server error:", error);
    return sendJson(res, 500, { message: "Internal server error." });
  }
});

server.listen(PORT, () => {
  console.log(`Auth server is running on http://localhost:${PORT} (storage: ${store.kind})`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    try {
      await store.close();
    } catch {
      // ignore close errors
    }

    server.close(() => {
      process.exit(0);
    });
  });
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || "").split(":");
  if (!salt || !hash) return false;

  const calculatedHash = scryptSync(password, salt, 64).toString("hex");
  const hashBuffer = Buffer.from(hash, "hex");
  const calculatedBuffer = Buffer.from(calculatedHash, "hex");

  if (hashBuffer.length !== calculatedBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, calculatedBuffer);
}

function createToken(payload) {
  const expiresAt = Date.now() + TOKEN_TTL_SECONDS * 1000;
  const encodedPayload = Buffer.from(JSON.stringify({ ...payload, exp: expiresAt })).toString("base64url");
  const signature = createHmac("sha256", TOKEN_SECRET).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  const [encodedPayload, receivedSignature] = String(token || "").split(".");
  if (!encodedPayload || !receivedSignature) return null;

  const expectedSignature = createHmac("sha256", TOKEN_SECRET).update(encodedPayload).digest("base64url");
  if (expectedSignature.length !== receivedSignature.length) return null;

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(receivedSignature);
  if (!timingSafeEqual(expectedBuffer, receivedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

async function getAuthenticatedUser(req) {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    return { ok: false, message: "Missing bearer token." };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { ok: false, message: "Token is invalid or expired." };
  }

  const user = await store.findUserById(payload.sub);
  if (!user) {
    return { ok: false, message: "User for this token was not found." };
  }

  return { ok: true, user };
}

function sanitizeChatMessages(messages) {
  return messages
    .slice(-100)
    .map((item, index) => {
      const role = item?.role === "assistant" ? "assistant" : item?.role === "user" ? "user" : null;
      const text = String(item?.text || "").trim();
      if (!role || !text) {
        return null;
      }

      return {
        id: Number(item?.id) || Date.now() + index,
        role,
        text: text.slice(0, 4000),
      };
    })
    .filter(Boolean);
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function getBearerToken(authorizationHeader) {
  if (!authorizationHeader) return null;
  const [type, token] = authorizationHeader.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

function isUniqueViolation(error) {
  return String(error?.code || "") === "23505";
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

function getJsonBody(req, res) {
  return new Promise((resolve) => {
    let raw = "";
    let finished = false;

    function finish(value) {
      if (finished) return;
      finished = true;
      resolve(value);
    }

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        sendJson(res, 413, { message: "Request body is too large." });
        req.destroy();
        finish(null);
      }
    });

    req.on("end", () => {
      if (finished) return;

      if (!raw) {
        finish({});
        return;
      }

      try {
        finish(JSON.parse(raw));
      } catch {
        sendJson(res, 400, { message: "Body must be valid JSON." });
        finish(null);
      }
    });

    req.on("error", () => {
      if (finished) return;
      sendJson(res, 400, { message: "Could not read request body." });
      finish(null);
    });
  });
}

function loadEnvIfExists(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  if (typeof process.loadEnvFile !== "function") {
    return;
  }

  try {
    process.loadEnvFile(filePath);
  } catch {
    // Ignore malformed env lines and continue.
  }
}
