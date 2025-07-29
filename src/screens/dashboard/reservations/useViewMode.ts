import { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

const VIEW_MODE_KEY = "reservations_view_mode"

type ViewMode = "grid" | "list"

export function useViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(VIEW_MODE_KEY)
      if (saved === "list" || saved === "grid") setViewMode(saved)
    })()
  }, [])

  const toggleViewMode = async () => {
    const next = viewMode === "grid" ? "list" : "grid"
    setViewMode(next)
    await AsyncStorage.setItem(VIEW_MODE_KEY, next)
  }

  return { viewMode, setViewMode, toggleViewMode }
}
