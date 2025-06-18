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
    lineHeight: 24,
    fontFamily: "Inter",
    fontWeight: "normal" as "normal",
  },
  label: {
    fontSize: 16,
    lineHeight: 24,
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
  background: "#FFFBFE", // Material background
  background2: "#E7E0EC", // Material surfaceVariant
  text: "#1C1B1F", // Material onBackground
  textSecondary: "#49454F", // Material onSurfaceVariant
  border: "#79747E", // Material outline
  card: "#FFFBFE", // Material surface
  notification: "#6750A4", // Material primary
  surface: "#FFFBFE", // Material surface
}

export const darkTheme = {
  ...colors,
  spacing,
  fonts,
  background: "#1C1B1F", // Material background
  background2: "#49454F", // Material surfaceVariant
  text: "#E6E1E5", // Material onBackground
  textSecondary: "#CAC4D0", // Material onSurfaceVariant
  border: "#938F99", // Material outline
  card: "#1C1B1F", // Material surface
  notification: "#D0BCFF", // Material primary
  surface: "#1C1B1F", // Material surface
}

export type ThemeType = typeof lightTheme
