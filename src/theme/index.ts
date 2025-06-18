export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
}

export const fonts = {
  body: {
    fontSize: 16,
    lineHeight: 18,
    fontFamily: "Inter",
    fontWeight: "normal" as "normal",
  },
  label: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Inter",
    fontWeight: "bold" as "bold",
  },
  hero: {
    fontSize: 32,
    lineHeight: 36,
    fontFamily: "Inter",
    fontWeight: "bold" as "bold",
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: "Inter",
    fontWeight: "bold" as "bold",
  },
  caption: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: "Inter",
    fontWeight: "normal" as "normal",
  },
}

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
  orange: "#f57e00",
  info: "#3b82f6",
}

export const lightTheme = {
  ...colors,
  spacing,
  fonts,
  background: colors.white,
  background2: colors.gray[100],
  text: colors.gray[900],
  textSecondary: colors.gray[600],
  border: colors.gray[900],
  card: colors.white,
  notification: colors.primary[500],
  surface: colors.gray[100],
}

export const darkTheme = {
  ...colors,
  spacing,
  background: "#1a1a1a",
  background2: "#2a2a2a",
  text: colors.gray[300],
  textSecondary: colors.gray[600],
  border: colors.gray[700],
  card: colors.gray[800],
  notification: colors.primary[500],
  surface: colors.gray[800],
}

export type ThemeType = typeof lightTheme
