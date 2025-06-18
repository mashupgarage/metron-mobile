// src/store/slices/themeSlice.ts
import { StateCreator } from "zustand"
import { lightTheme, darkTheme, ThemeType } from "../../theme"

export type ThemeSlice = {
  theme: ThemeType
  isDark: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
}

export const createThemeSlice: StateCreator<ThemeSlice> = (set) => ({
  theme: lightTheme,
  isDark: false,

  toggleTheme: () =>
    set((state) => {
      const newIsDark = !state.isDark
      return {
        isDark: newIsDark,
        theme: newIsDark ? darkTheme : lightTheme,
      }
    }),

  setTheme: (isDark: boolean) =>
    set({
      isDark,
      theme: isDark ? darkTheme : lightTheme,
    }),
})
