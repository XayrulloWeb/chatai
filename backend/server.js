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
const DEFAULT_CORS_ORIGINS = [
  "https://chataix.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000",
];
const CORS_ORIGINS = parseCorsOrigins(process.env.AUTH_CORS_ORIGIN, DEFAULT_CORS_ORIGINS);
const MOTIVATION_LEVELS = [
  { id: "start", title: "Start", minXp: 0 },
  { id: "izlanuvchi", title: "Izlanuvchi", minXp: 100 },
  { id: "tahlilchi", title: "Tahlilchi", minXp: 250 },
  { id: "lider", title: "Lider", minXp: 450 },
];
const MOTIVATION_TASKS = [
  {
    id: "safe-link-check",
    title: "Phishing havolani aniqlang",
    description: "Xavfli xabarni tanlash orqali raqamli xavfsizlikni tekshiring.",
    question: "Qaysi holat phishing xavfi eng yuqori ekanini ko'rsatadi?",
    options: [
      { id: "a", text: "Noma'lum emaildan 'hisobni tasdiqlang' degan shoshilinch havola keladi" },
      { id: "b", text: "Maktab o'qituvchisi topshiriq faylini rasmiy guruhga joylaydi" },
      { id: "c", text: "Kutubxona saytida jadval PDF sifatida berilgan" },
      { id: "d", text: "Darslik havolasi eduportal.uz domenida ochiladi" },
    ],
    correctOptionId: "a",
    xp: 30,
  },
  {
    id: "strong-password",
    title: "Kuchli parolni tanlang",
    description: "Parol xavfsizligi bo'yicha to'g'ri variantni tanlang.",
    question: "Qaysi parol eng kuchli va xavfsiz hisoblanadi?",
    options: [
      { id: "a", text: "12345678" },
      { id: "b", text: "qwerty2024" },
      { id: "c", text: "Ali2009" },
      { id: "d", text: "T9!mQ2#zL7@p" },
    ],
    correctOptionId: "d",
    xp: 40,
  },
  {
    id: "prompt-quality",
    title: "Yaxshi promptni toping",
    description: "AI bilan ishlashda aniq va sifatli so'rovni ajrating.",
    question: "Quyidagilardan qaysi biri eng yaxshi prompt?",
    options: [
      { id: "a", text: "Menga hammasini aytib ber" },
      { id: "b", text: "Informatika mavzusini tushuntir" },
      { id: "c", text: "7-sinf uchun algoritm mavzusini 3 qadam bilan oddiy tilda tushuntir va 1 misol ber" },
      { id: "d", text: "Tezroq javob yoz" },
    ],
    correctOptionId: "c",
    xp: 30,
  },
  {
    id: "fact-check",
    title: "Fakt tekshiruv qoidasi",
    description: "AI javobini ishonchli ishlatish uchun to'g'ri qadamni tanlang.",
    question: "AI javobidan keyingi eng to'g'ri harakat qaysi?",
    options: [
      { id: "a", text: "Javobni tekshirmasdan darhol ishlatish" },
      { id: "b", text: "Kamida 2 ishonchli manba bilan solishtirish" },
      { id: "c", text: "Faqat do'st fikrini so'rash" },
      { id: "d", text: "Faqat AIga yana bir bor savol berish" },
    ],
    correctOptionId: "b",
    xp: 25,
  },
];

const store = await createStore();

const server = createServer(async (req, res) => {
  const requestPath = normalizeRequestPath(req.url);
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    if (requestPath === "/health" && req.method === "GET") {
      return sendJson(res, 200, { ok: true, storage: store.kind });
    }

    if (requestPath === "/api/auth/register" && req.method === "POST") {
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

    if (requestPath === "/api/auth/login" && req.method === "POST") {
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

    if (requestPath === "/api/auth/me" && req.method === "GET") {
      const auth = await getAuthenticatedUser(req);
      if (!auth.ok) {
        return sendJson(res, 401, { message: auth.message });
      }

      return sendJson(res, 200, {
        user: publicUser(auth.user),
      });
    }

    if (requestPath === "/api/chat/messages" && req.method === "GET") {
      const auth = await getAuthenticatedUser(req);
      if (!auth.ok) {
        return sendJson(res, 401, { message: auth.message });
      }

      const messages = await store.getChatMessages(auth.user.id);
      return sendJson(res, 200, { messages });
    }

    if (requestPath === "/api/chat/messages" && req.method === "PUT") {
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

    if (requestPath === "/api/motivation/progress" && req.method === "GET") {
      const auth = await getAuthenticatedUser(req);
      if (!auth.ok) {
        return sendJson(res, 401, { message: auth.message });
      }

      const progress = await store.getMotivationProgress(auth.user.id);
      return sendJson(res, 200, buildMotivationPayload(progress));
    }

    if (requestPath === "/api/motivation/tasks/solve" && req.method === "POST") {
      const auth = await getAuthenticatedUser(req);
      if (!auth.ok) {
        return sendJson(res, 401, { message: auth.message });
      }

      const body = await getJsonBody(req, res);
      if (!body) return;

      const taskId = String(body.taskId || "").trim();
      const task = MOTIVATION_TASKS.find((item) => item.id === taskId);
      if (!task) {
        return sendJson(res, 400, { message: "taskId is invalid." });
      }

      const answerOptionId = String(body.answerOptionId || "").trim();
      if (!answerOptionId) {
        return sendJson(res, 400, { message: "answerOptionId is required." });
      }

      const isValidOption = task.options.some((option) => option.id === answerOptionId);
      if (!isValidOption) {
        return sendJson(res, 400, { message: "answerOptionId is invalid for this task." });
      }

      const currentProgress = normalizeMotivationProgress(await store.getMotivationProgress(auth.user.id));
      if (currentProgress.completedTaskIds.includes(task.id)) {
        return sendJson(res, 200, {
          ok: true,
          alreadyCompleted: true,
          correct: true,
          message: "Bu vazifa allaqachon bajarilgan.",
          ...buildMotivationPayload(currentProgress),
        });
      }

      const isCorrect = answerOptionId === task.correctOptionId;
      if (!isCorrect) {
        return sendJson(res, 200, {
          ok: true,
          alreadyCompleted: false,
          correct: false,
          message: "Javob noto'g'ri. Yana bir bor urinib ko'ring.",
          ...buildMotivationPayload(currentProgress),
        });
      }

      const nextProgress = {
        xp: currentProgress.xp + task.xp,
        completedTaskIds: [...currentProgress.completedTaskIds, task.id],
        updatedAt: new Date().toISOString(),
      };

      const savedProgress = await store.setMotivationProgress(auth.user.id, nextProgress);
      return sendJson(res, 200, {
        ok: true,
        alreadyCompleted: false,
        correct: true,
        message: `Ajoyib! +${task.xp} XP qo'shildi.`,
        ...buildMotivationPayload(savedProgress),
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

function buildMotivationPayload(rawProgress) {
  const progress = normalizeMotivationProgress(rawProgress);
  const level = resolveMotivationLevel(progress.xp);
  const nextLevel = MOTIVATION_LEVELS.find((item) => item.minXp > progress.xp) || null;
  const progressToNextLevel = nextLevel
    ? Math.min(
        100,
        Math.floor(((progress.xp - level.minXp) / Math.max(1, nextLevel.minXp - level.minXp)) * 100)
      )
    : 100;

  const completedTaskIds = progress.completedTaskIds;
  const completedTaskCount = completedTaskIds.length;
  const totalTaskCount = MOTIVATION_TASKS.length;
  const tasks = MOTIVATION_TASKS.map((task) => publicMotivationTask(task, completedTaskIds.includes(task.id)));

  return {
    xp: progress.xp,
    level,
    nextLevel,
    progressToNextLevel,
    completedTaskIds,
    completedTaskCount,
    totalTaskCount,
    tasks,
    badges: buildBadges(completedTaskIds),
    updatedAt: progress.updatedAt,
  };
}

function resolveMotivationLevel(xp) {
  let current = MOTIVATION_LEVELS[0];
  for (const level of MOTIVATION_LEVELS) {
    if (xp >= level.minXp) {
      current = level;
    }
  }
  return current;
}

function buildBadges(completedTaskIds) {
  const has = (taskId) => completedTaskIds.includes(taskId);
  const hasAllTasks = MOTIVATION_TASKS.every((task) => has(task.id));
  return [
    {
      id: "prompt-ustasi",
      title: "Prompt Ustasi",
      unlocked: has("prompt-quality"),
    },
    {
      id: "tekshiruvchi",
      title: "Tekshiruvchi",
      unlocked: has("fact-check"),
    },
    {
      id: "xavfsizlik-qalqoni",
      title: "Xavfsizlik Qalqoni",
      unlocked: has("safe-link-check") && has("strong-password"),
    },
    {
      id: "intizom",
      title: "Intizom",
      unlocked: hasAllTasks,
    },
  ];
}

function publicMotivationTask(task, completed) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    question: task.question,
    options: task.options,
    xp: task.xp,
    completed,
  };
}

function normalizeMotivationProgress(progress) {
  const xpNumber = Number(progress?.xp);
  const xp = Number.isFinite(xpNumber) && xpNumber > 0 ? Math.floor(xpNumber) : 0;
  const completedTaskIds = Array.isArray(progress?.completedTaskIds)
    ? progress.completedTaskIds
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .filter((item, index, list) => list.indexOf(item) === index)
    : [];

  const updatedAt =
    progress?.updatedAt && !Number.isNaN(Date.parse(String(progress.updatedAt)))
      ? new Date(progress.updatedAt).toISOString()
      : new Date().toISOString();

  return { xp, completedTaskIds, updatedAt };
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

function setCorsHeaders(req, res) {
  const origin = String(req.headers.origin || "");
  const allowedOrigin = getAllowedCorsOrigin(origin);
  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function normalizeRequestPath(rawUrl) {
  try {
    const pathname = new URL(String(rawUrl || "/"), "http://localhost").pathname;
    const collapsed = pathname.replace(/\/{2,}/g, "/");
    if (collapsed !== "/" && collapsed.endsWith("/")) {
      return collapsed.replace(/\/+$/, "");
    }
    return collapsed || "/";
  } catch {
    return "/";
  }
}

function parseCorsOrigins(rawValue, defaultOrigins = []) {
  const value = String(rawValue || "").trim();
  if (value === "*") {
    return { wildcard: true, values: new Set() };
  }

  const envOrigins = value
    ? value
        .split(",")
        .map((item) => normalizeOrigin(item))
        .filter(Boolean)
    : [];

  const defaults = defaultOrigins
    .map((item) => normalizeOrigin(item))
    .filter(Boolean);

  const values = new Set([...defaults, ...envOrigins]);
  if (values.size === 0) {
    return { wildcard: true, values };
  }

  return { wildcard: false, values };
}

function getAllowedCorsOrigin(requestOrigin) {
  const normalizedRequestOrigin = normalizeOrigin(requestOrigin);
  if (CORS_ORIGINS.wildcard) {
    return "*";
  }

  if (!normalizedRequestOrigin) {
    return null;
  }

  return CORS_ORIGINS.values.has(normalizedRequestOrigin) ? normalizedRequestOrigin : null;
}

function normalizeOrigin(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  try {
    return new URL(raw).origin;
  } catch {
    return raw.replace(/\/+$/, "").toLowerCase();
  }
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
