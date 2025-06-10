export const colors = {
  // Primary colors
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },
  // Grayscale
  white: "#ffffff",
  black: "#121212",
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  // Status colors
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

export const lightTheme = {
  ...colors,
  background: colors.white,
  text: colors.gray[900],
  border: colors.gray[200],
  card: colors.white,
  notification: colors.primary[500],
};

export const darkTheme = {
  ...colors,
  background: "#1a1a1a",
  text: colors.gray[100],
  border: colors.gray[700],
  card: colors.gray[800],
  notification: colors.primary[500],
};

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
};

export type ThemeType = typeof lightTheme;
