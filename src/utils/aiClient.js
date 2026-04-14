import { resolveDemoResponse } from "../data/chatbotData.js";

const provider = import.meta.env.VITE_AI_PROVIDER || "demo";
const geminiBaseUrl = "https://generativelanguage.googleapis.com";
const retryableStatuses = new Set([429, 500, 502, 503, 504]);
let geminiModelListPromise = null;
const assistantSystemInstruction = `
Siz maktab o'quvchilari va o'qituvchilar uchun ta'limiy AI yordamchisiz.
Asosiy yo'nalish: sun'iy intellektdan to'g'ri, xavfsiz va samarali foydalanish.
Javob uslubi:
- faqat o'zbek tilida (lotin)
- sodda, do'stona va tushunarli
- iloji boricha amaliy qadamlarga bo'lingan
- kerak bo'lsa qisqa misol keltiring
- oddiy matn yozing, markdown belgilarini ishlatmang (**, #, *)
Muhim g'oya: AI yordamchi vosita, lekin inson fikrlashining o'rnini bosmaydi.
`;

export async function askAssistant({ prompt, history = [] }) {
  const text = String(prompt || "").trim();
  if (!text) {
    return "Savolingizni yozing, men yordam beraman.";
  }

  if (provider === "gemini") {
    return askGemini({ prompt: text, history });
  }

  if (provider === "openai") {
    return askOpenAI({ prompt: text, history });
  }

  return askDemo({ prompt: text });
}

async function askDemo({ prompt }) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return resolveDemoResponse(prompt);
}

async function askGemini({ prompt, history }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return "Gemini API key topilmadi. Hozircha demo rejimda ishlatish tavsiya etiladi.";
  }

  const preferredModel = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";
  const discoveredModels = await getGeminiModels(apiKey);
  const fallbackModels = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest"
  ];
  const models = unique([preferredModel, ...discoveredModels, ...fallbackModels]);

  let lastError = "";
  let hadServiceUnavailable = false;

  for (const model of models) {
    for (const version of ["v1beta", "v1"]) {
      const contents = buildGeminiContents(history, prompt);
      const generationConfig = buildGeminiGenerationConfig(model);
      let response;
      try {
        response = await fetchWithRetry(
          `${geminiBaseUrl}/${version}/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: assistantSystemInstruction }] },
              contents,
              generationConfig
            })
          }
        );
      } catch (error) {
        lastError = `Model: ${model}, API: ${version}, tarmoq xatosi: ${error?.message || "unknown"}`;
        continue;
      }

      if (response.ok) {
        const data = await response.json();
        const firstText = readGeminiText(data);
        const finishReason = data?.candidates?.[0]?.finishReason || "";

        if (!firstText) {
          lastError = `Model: ${model}, API: ${version}, bo'sh javob qaytdi`;
          continue;
        }

        if (finishReason === "MAX_TOKENS" || isLikelyCutoff(firstText)) {
          const continuedText = await continueGeminiReply({
            apiKey,
            version,
            model,
            contents,
            partialText: firstText,
            generationConfig
          });

          if (continuedText) {
            return sanitizeModelText(`${firstText}\n${continuedText}`);
          }
        }

        return sanitizeModelText(firstText);
      }

      const errorMessage = await readErrorMessage(response);
      if (response.status === 503) {
        hadServiceUnavailable = true;
      }
      lastError = `Model: ${model}, API: ${version}, HTTP ${response.status}${
        errorMessage ? `, ${errorMessage}` : ""
      }`;
    }
  }

  if (hadServiceUnavailable) {
    return "Gemini xizmati vaqtincha band (503). Bir necha soniyadan keyin qayta urinib ko'ring.";
  }

  return `Gemini javobi olinmadi. ${lastError || "API key, model va loyiha sozlamasini tekshiring."}`;
}

async function continueGeminiReply({ apiKey, version, model, contents, partialText, generationConfig }) {
  const continuationContents = [
    ...contents,
    { role: "model", parts: [{ text: partialText }] },
    { role: "user", parts: [{ text: "Javobni shu joyidan davom ettirib, to'liq yakunlab bering." }] }
  ];

  let response;
  try {
    response = await fetchWithRetry(
      `${geminiBaseUrl}/${version}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: assistantSystemInstruction }] },
          contents: continuationContents,
          generationConfig
        })
      }
    );
  } catch {
    return "";
  }

  if (!response.ok) {
    return "";
  }

  const data = await response.json();
  return sanitizeModelText(readGeminiText(data));
}

async function getGeminiModels(apiKey) {
  if (!geminiModelListPromise) {
    geminiModelListPromise = (async () => {
      const response = await fetchWithRetry(`${geminiBaseUrl}/v1beta/models?key=${apiKey}`);
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const models = data?.models ?? [];

      return models
        .filter((model) => model?.supportedGenerationMethods?.includes("generateContent"))
        .map((model) => String(model.name || "").replace(/^models\//, ""))
        .filter(Boolean)
        .sort((a, b) => scoreGeminiModel(b) - scoreGeminiModel(a));
    })().catch(() => []);
  }

  return geminiModelListPromise;
}

function scoreGeminiModel(modelName) {
  let score = 0;
  if (modelName.includes("2.5")) score += 100;
  if (modelName.includes("2.0")) score += 60;
  if (modelName.includes("flash")) score += 30;
  if (modelName.includes("pro")) score += 20;
  if (modelName.includes("preview")) score -= 5;
  return score;
}

function unique(list) {
  return list.filter((item, index) => item && list.indexOf(item) === index);
}

async function readErrorMessage(response) {
  try {
    const errorData = await response.json();
    return errorData?.error?.message ?? "";
  } catch {
    return "";
  }
}

async function fetchWithRetry(url, options, config = {}) {
  const maxRetries = config.maxRetries ?? 2;
  const baseDelayMs = config.baseDelayMs ?? 650;

  let lastNetworkError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetch(url, options);

      if (!retryableStatuses.has(response.status) || attempt === maxRetries) {
        return response;
      }
    } catch (error) {
      lastNetworkError = error;
      if (attempt === maxRetries) {
        throw error;
      }
    }

    const backoffMs = baseDelayMs * (attempt + 1);
    await sleep(backoffMs);
  }

  throw lastNetworkError ?? new Error("Unknown network error");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function askOpenAI({ prompt, history }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return "OpenAI API key topilmadi. Hozircha demo rejimda ishlatish tavsiya etiladi.";
  }

  const historyMessages = buildOpenAIMessages(history, prompt);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: assistantSystemInstruction
        },
        ...historyMessages
      ]
    })
  });

  if (!response.ok) {
    return "OpenAI xizmatiga ulanishda xatolik bo'ldi. Demo rejimdan foydalaning.";
  }

  const data = await response.json();
  return sanitizeModelText(data?.choices?.[0]?.message?.content ?? "Javob olinmadi. Iltimos, qayta urinib ko'ring.");
}

function buildOpenAIMessages(history, prompt) {
  const mapped = (history || [])
    .map((item) => {
      const role = item?.role === "assistant" ? "assistant" : item?.role === "user" ? "user" : null;
      const content = String(item?.text || item?.content || "").trim();
      return role && content ? { role, content } : null;
    })
    .filter(Boolean);

  if (mapped.length === 0) {
    return [{ role: "user", content: prompt }];
  }

  const last = mapped[mapped.length - 1];
  if (last.role !== "user" || last.content !== prompt) {
    mapped.push({ role: "user", content: prompt });
  }

  return mapped;
}

function buildGeminiContents(history, prompt) {
  const mapped = (history || [])
    .map((item) => {
      const role = item?.role === "assistant" ? "model" : item?.role === "user" ? "user" : null;
      const text = String(item?.text || item?.content || "").trim();
      return role && text ? { role, parts: [{ text }] } : null;
    })
    .filter(Boolean);

  const firstUserIndex = mapped.findIndex((item) => item.role === "user");
  const trimmed = firstUserIndex >= 0 ? mapped.slice(firstUserIndex) : [];

  if (trimmed.length === 0) {
    return [{ role: "user", parts: [{ text: prompt }] }];
  }

  const last = trimmed[trimmed.length - 1];
  const lastText = last?.parts?.[0]?.text ?? "";
  if (last.role !== "user" || lastText !== prompt) {
    trimmed.push({ role: "user", parts: [{ text: prompt }] });
  }

  return trimmed;
}

function buildGeminiGenerationConfig(model) {
  const config = {
    temperature: 0.4,
    maxOutputTokens: 900
  };

  if (model.includes("2.5")) {
    config.thinkingConfig = { thinkingBudget: 0 };
  }

  return config;
}

function readGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();

  return text;
}

function isLikelyCutoff(text) {
  if (text.length < 20) {
    return false;
  }

  if (/[.!?…]$/.test(text.trim())) {
    return false;
  }

  return /[a-zA-Zа-яА-Яʻ'`-]$/.test(text.trim());
}

function sanitizeModelText(text) {
  const normalized = String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .trim();

  return normalized || "Javob olinmadi. Iltimos, qayta urinib ko'ring.";
}
