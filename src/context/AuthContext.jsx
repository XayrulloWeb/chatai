import { createContext, useContext, useEffect, useMemo, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage.js";
import { buildAuthApiUrl } from "../utils/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useLocalStorage("ai_auth_token", "");
  const [user, setUser] = useLocalStorage("ai_auth_user", null);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(token));

  useEffect(() => {
    let isCurrent = true;

    if (!token) {
      setIsBootstrapping(false);
      return () => {
        isCurrent = false;
      };
    }

    if (isTokenExpired(token)) {
      setToken("");
      setUser(null);
      setIsBootstrapping(false);
      return () => {
        isCurrent = false;
      };
    }

    (async () => {
      try {
        const data = await request("/api/auth/me", { token });
        if (!isCurrent) return;
        setUser(data.user);
      } catch (error) {
        if (!isCurrent) return;
        if (shouldClearSession(error)) {
          setToken("");
          setUser(null);
        }
      } finally {
        if (isCurrent) {
          setIsBootstrapping(false);
        }
      }
    })();

    return () => {
      isCurrent = false;
    };
  }, [token, setToken, setUser]);

  const value = useMemo(
    () => ({
      user,
      token,
      isBootstrapping,
      isAuthenticated: Boolean(token && user),
      register: async ({ name, email, password }) => {
        const data = await request("/api/auth/register", {
          method: "POST",
          body: { name, email, password },
        });
        setToken(data.token);
        setUser(data.user);
        return data.user;
      },
      login: async ({ email, password }) => {
        const data = await request("/api/auth/login", {
          method: "POST",
          body: { email, password },
        });
        setToken(data.token);
        setUser(data.user);
        return data.user;
      },
      logout: () => {
        setToken("");
        setUser(null);
      },
    }),
    [isBootstrapping, token, user, setToken, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

async function request(path, options = {}) {
  const { method = "GET", body, token } = options;
  const headers = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(body ? { "Content-Type": "application/json" } : {}),
  };

  let response;
  try {
    response = await fetch(buildAuthApiUrl(path), {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    throw new AuthRequestError("Network error while requesting auth API.", {
      code: "NETWORK_ERROR",
      cause: error,
    });
  }

  const data = await readJson(response);
  if (!response.ok) {
    throw new AuthRequestError(data?.message || "Auth request failed.", {
      status: response.status,
      code: response.status === 401 || response.status === 403 ? "UNAUTHORIZED" : "HTTP_ERROR",
    });
  }

  return data;
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function shouldClearSession(error) {
  if (!(error instanceof AuthRequestError)) {
    return false;
  }

  if (error.code === "UNAUTHORIZED") {
    return true;
  }

  if (error.status === 401 || error.status === 403) {
    return true;
  }

  return false;
}

function isTokenExpired(token) {
  const payload = readTokenPayload(token);
  if (!payload || typeof payload.exp !== "number") {
    return false;
  }

  return Date.now() > payload.exp;
}

function readTokenPayload(token) {
  const encodedPayload = String(token || "").split(".")[0];
  if (!encodedPayload) {
    return null;
  }

  try {
    const json = decodeBase64Url(encodedPayload);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function decodeBase64Url(value) {
  const normalized = String(value || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");

  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return decodeURIComponent(
      Array.from(window.atob(padded))
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
  }

  return "";
}

class AuthRequestError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "AuthRequestError";
    this.status = options.status;
    this.code = options.code || "AUTH_ERROR";
    this.cause = options.cause;
  }
}
