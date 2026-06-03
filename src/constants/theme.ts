import { Monitor, Moon, Sun } from "lucide-react";

export const THEME_STORAGE_KEY = "taskflow-theme";

export type ThemeMode = "light" | "dark" | "system";

export const themeOptions = [
  { label: "Light", value: "light", icon: Sun },
  { label: "Dark", value: "dark", icon: Moon },
  { label: "System", value: "system", icon: Monitor },
] satisfies Array<{
  label: string;
  value: ThemeMode;
  icon: typeof Sun;
}>;
