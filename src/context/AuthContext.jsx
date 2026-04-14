import { createContext, useContext, useEffect, useMemo, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage.js";

const AuthContext = createContext(null);
const authApiBaseUrl = import.meta.env.VITE_AUTH_API_URL || "http://localhost:4000";

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

    (async () => {
      try {
        const data = await request("/api/auth/me", { token });
        if (!isCurrent) return;
        setUser(data.user);
      } catch {
        if (!isCurrent) return;
        setToken("");
        setUser(null);
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

  const response = await fetch(`${authApiBaseUrl}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(data?.message || "Auth request failed.");
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
