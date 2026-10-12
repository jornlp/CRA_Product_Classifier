/**
 * Colour scheme switch: Auto (follow the system), Light or Dark. The choice is a per-viewer
 * convenience kept in localStorage; if storage is unavailable the page simply follows the system.
 */
type Theme = "auto" | "light" | "dark";
const KEY = "cra-theme";

function read(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : "auto";
  } catch { return "auto"; }
}

function apply(t: Theme) {
  if (t === "auto") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  document.querySelectorAll<HTMLButtonElement>("[data-theme-choice]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.themeChoice === t)));
  try { if (t === "auto") localStorage.removeItem(KEY); else localStorage.setItem(KEY, t); } catch { /* not stored */ }
}

export function initTheme() {
  apply(read());
  document.querySelectorAll<HTMLButtonElement>("[data-theme-choice]").forEach((b) =>
    b.addEventListener("click", () => apply(b.dataset.themeChoice as Theme)));
}
