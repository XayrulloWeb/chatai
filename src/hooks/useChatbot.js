import { startTransition, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { askAssistant } from "../utils/aiClient.js";
import { buildAuthApiUrl } from "../utils/authApi.js";

const initialMessages = [
  {
    id: 1,
    role: "assistant",
    text: "Assalomu alaykum. Men ta'limiy chatbotman. AI, prompt yozish va xavfsiz foydalanish haqida savol berishingiz mumkin."
  }
];
const localChatPrefix = "ai_chat_backup";

export default function useChatbot() {
  const { user, token, isAuthenticated, isBootstrapping } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingHistory, setIsSyncingHistory] = useState(false);
  const [syncError, setSyncError] = useState("");
  const hydratedKeyRef = useRef("");
  const lastSavedSnapshotRef = useRef("");
  const userKey = user?.id || user?.email || "guest";
  const localStorageKey = `${localChatPrefix}:${userKey}`;

  useEffect(() => {
    let isCurrent = true;

    if (isBootstrapping) {
      return () => {
        isCurrent = false;
      };
    }

    if (!isAuthenticated || !token) {
      setMessages(initialMessages);
      hydratedKeyRef.current = "";
      lastSavedSnapshotRef.current = JSON.stringify(initialMessages);
      setSyncError("");
      return () => {
        isCurrent = false;
      };
    }

    const hydrationKey = token;
    hydratedKeyRef.current = "";
    setIsSyncingHistory(true);

    (async () => {
      try {
        const data = await requestChat("/api/chat/messages", { token });
        if (!isCurrent) return;

        const nextMessages = normalizeMessages(data?.messages);
        const fallbackMessages = readLocalMessages(localStorageKey);
        const finalMessages =
          nextMessages.length > 0
            ? nextMessages
            : fallbackMessages.length > 0
              ? fallbackMessages
              : initialMessages;
        setMessages(finalMessages);
        lastSavedSnapshotRef.current = JSON.stringify(finalMessages);
        setSyncError("");
      } catch {
        if (!isCurrent) return;
        const fallbackMessages = readLocalMessages(localStorageKey);
        const finalMessages = fallbackMessages.length > 0 ? fallbackMessages : initialMessages;
        setMessages(finalMessages);
        lastSavedSnapshotRef.current = JSON.stringify(finalMessages);
        setSyncError("Server bilan chat sinxronlashmadi. Hozircha lokal saqlash ishlatilmoqda.");
      } finally {
        if (isCurrent) {
          hydratedKeyRef.current = hydrationKey;
          setIsSyncingHistory(false);
        }
      }
    })();

    return () => {
      isCurrent = false;
    };
  }, [isAuthenticated, isBootstrapping, token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    saveLocalMessages(localStorageKey, messages);

    if (hydratedKeyRef.current !== token) {
      return;
    }

    const snapshot = JSON.stringify(messages);
    if (snapshot === lastSavedSnapshotRef.current) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const data = await requestChat("/api/chat/messages", {
          method: "PUT",
          token,
          body: { messages },
        });

        if (cancelled) return;
        const normalized = normalizeMessages(data?.messages);
        lastSavedSnapshotRef.current = JSON.stringify(normalized);
        setSyncError("");
      } catch {
        if (cancelled) return;
        setSyncError("Serverga saqlashda xatolik. Lokal nusxa saqlandi.");
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isAuthenticated, localStorageKey, messages, token]);

  const sendMessage = async (customMessage) => {
    const text = (customMessage ?? input).trim();
    if (!text || isLoading) {
      return;
    }

    const userMessage = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await askAssistant({ prompt: text, history: [...messages, userMessage] });
      startTransition(() => {
        setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", text: reply }]);
      });
    } catch {
      startTransition(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            text: "Hozircha javob berishda muammo bo'ldi. Iltimos, qayta urinib ko'ring."
          }
        ]);
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    isSyncingHistory,
    syncError,
    sendMessage
  };
}

async function requestChat(path, options = {}) {
  const { method = "GET", token, body } = options;
  const response = await fetch(buildAuthApiUrl(path), {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(data?.message || "Chat history request failed.");
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

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((item, index) => {
      const role = item?.role === "assistant" ? "assistant" : item?.role === "user" ? "user" : null;
      const text = String(item?.text || "").trim();
      if (!role || !text) {
        return null;
      }

      return {
        id: Number(item?.id) || Date.now() + index,
        role,
        text,
      };
    })
    .filter(Boolean);
}

function readLocalMessages(storageKey) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalizeMessages(parsed);
  } catch {
    return [];
  }
}

function saveLocalMessages(storageKey, messages) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(messages));
  } catch {
    // Ignore localStorage quota/security errors.
  }
}
