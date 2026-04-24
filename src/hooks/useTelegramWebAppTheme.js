import { useEffect } from "react";

const TELEGRAM_BODY_CLASS = "telegram-webapp";
const TELEGRAM_DARK_BODY_CLASS = "telegram-webapp-dark";
const FALLBACK_THEME = {
  bg_color: "#f2f6ff",
  text_color: "#1f2937",
  hint_color: "#64748b",
  link_color: "#3363ff",
  button_color: "#3363ff",
  button_text_color: "#ffffff",
  secondary_bg_color: "#ffffff",
  header_bg_color: "#ffffff",
};

export default function useTelegramWebAppTheme() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const webApp = window.Telegram?.WebApp;
    if (!webApp) {
      document.body.classList.remove(TELEGRAM_BODY_CLASS);
      document.body.classList.remove(TELEGRAM_DARK_BODY_CLASS);
      return;
    }

    document.body.classList.add(TELEGRAM_BODY_CLASS);
    applyTelegramTheme(webApp);

    try {
      webApp.ready();
      webApp.expand();
    } catch {
      // Ignore bridge errors and keep default web behavior.
    }

    const onThemeChanged = () => applyTelegramTheme(webApp);
    webApp.onEvent?.("themeChanged", onThemeChanged);

    return () => {
      webApp.offEvent?.("themeChanged", onThemeChanged);
      document.body.classList.remove(TELEGRAM_BODY_CLASS);
      document.body.classList.remove(TELEGRAM_DARK_BODY_CLASS);
    };
  }, []);
}

function applyTelegramTheme(webApp) {
  const themeParams = { ...FALLBACK_THEME, ...(webApp?.themeParams || {}) };
  const root = document.documentElement;

  setCssVar(root, "--tg-bg-color", pickThemeColor(themeParams.bg_color, FALLBACK_THEME.bg_color));
  setCssVar(root, "--tg-text-color", pickThemeColor(themeParams.text_color, FALLBACK_THEME.text_color));
  setCssVar(root, "--tg-hint-color", pickThemeColor(themeParams.hint_color, FALLBACK_THEME.hint_color));
  setCssVar(root, "--tg-link-color", pickThemeColor(themeParams.link_color, FALLBACK_THEME.link_color));
  setCssVar(root, "--tg-button-color", pickThemeColor(themeParams.button_color, FALLBACK_THEME.button_color));
  setCssVar(
    root,
    "--tg-button-text-color",
    pickThemeColor(themeParams.button_text_color, FALLBACK_THEME.button_text_color)
  );
  setCssVar(
    root,
    "--tg-secondary-bg-color",
    pickThemeColor(themeParams.secondary_bg_color, FALLBACK_THEME.secondary_bg_color)
  );
  setCssVar(
    root,
    "--tg-header-bg-color",
    pickThemeColor(themeParams.header_bg_color, FALLBACK_THEME.header_bg_color)
  );

  document.body.classList.toggle(TELEGRAM_DARK_BODY_CLASS, isDarkColor(themeParams.bg_color));
}

function setCssVar(target, name, value) {
  if (!target || !name) return;
  target.style.setProperty(name, value);
}

function pickThemeColor(value, fallback) {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

function isDarkColor(value) {
  const rgb = parseColor(value);
  if (!rgb) return false;

  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness < 140;
}

function parseColor(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return null;

  if (raw.startsWith("#")) {
    return parseHexColor(raw);
  }

  const rgbMatch = raw.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!rgbMatch) return null;

  return {
    r: clampChannel(Number(rgbMatch[1])),
    g: clampChannel(Number(rgbMatch[2])),
    b: clampChannel(Number(rgbMatch[3])),
  };
}

function parseHexColor(hex) {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return {
      r: clampChannel(parseInt(clean[0] + clean[0], 16)),
      g: clampChannel(parseInt(clean[1] + clean[1], 16)),
      b: clampChannel(parseInt(clean[2] + clean[2], 16)),
    };
  }

  if (clean.length !== 6) {
    return null;
  }

  return {
    r: clampChannel(parseInt(clean.slice(0, 2), 16)),
    g: clampChannel(parseInt(clean.slice(2, 4), 16)),
    b: clampChannel(parseInt(clean.slice(4, 6), 16)),
  };
}

function clampChannel(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(255, value));
}
