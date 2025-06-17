// src/hooks/useNavigationTheme.ts
import { useMemo } from "react";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";
import { lightTheme, darkTheme } from "../theme";
import { useBoundStore } from "../store";

export const useThemeManager = () => {
  const isDark = useBoundStore((state) => state.isDark);

  return useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
        primary: isDark ? darkTheme.primary[500] : lightTheme.primary[500],
        background: isDark ? darkTheme.background : lightTheme.background,
        card: isDark ? darkTheme.card : lightTheme.card,
        text: isDark ? darkTheme.text : lightTheme.text,
        border: isDark ? darkTheme.border : lightTheme.border,
        notification: isDark ? darkTheme.notification : lightTheme.notification,
      },
    }),
    [isDark]
  );
};
