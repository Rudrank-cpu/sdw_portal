import { create } from "zustand";

interface ThemeState {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

function readTheme(): ThemeState["theme"] {
  return localStorage.getItem("theme") === "light" ? "light" : "dark";
}

function applyTheme(theme: ThemeState["theme"]) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: readTheme(),
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === "dark" ? "light" : "dark";
      applyTheme(theme);
      return { theme };
    }),
}));
