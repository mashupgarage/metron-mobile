import { StatusBar } from "expo-status-bar"
import "./global.css"
import { useFonts } from "expo-font"
import { InterFonts } from "./src/assets/fonts"
import { UrbanistFonts } from "./src/assets/fonts"
import { PublicSansFonts } from "./src/assets/fonts"
import { GluestackUIProvider } from "@/src/components/ui/gluestack-ui-provider"
import { useColorScheme } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { lightTheme, darkTheme } from "./src/theme"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { AuthStack } from "./src/navigation/AuthStack"
import { DashboardStack } from "./src/navigation/DashboardStack"
import { useEffect } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { loadAuthTokenToAxios } from "./src/api/tokenManager"
import { useBoundStore } from "./src/store"

// Remove explicit type for Stack.Navigator to avoid type errors
const Stack = createNativeStackNavigator()

// Define screen options based on color scheme
const getScreenOptions = (isDark: boolean) => ({
  headerStyle: {
    backgroundColor: isDark ? darkTheme.card : lightTheme.card,
  },
  headerTintColor: isDark ? darkTheme.text : lightTheme.text,
  headerTitleStyle: {
    color: isDark ? darkTheme.text : lightTheme.text,
  },
  headerBackTitle: "",
  headerShadowVisible: false,
})

// Get the theme from the store and update it when the system theme changes
function useThemeInitializer() {
  const { setTheme } = useBoundStore()
  const colorScheme = useColorScheme()

  useEffect(() => {
    setTheme(colorScheme === "dark")
  }, [])
}

export default function App() {
  const theme = useBoundStore((state) => state.theme)
  const isDark = useBoundStore((state) => state.isDark)
  const [fontsLoaded] = useFonts({
    ...InterFonts,
    ...UrbanistFonts,
    ...PublicSansFonts,
  })

  // Initialize theme based on system preference
  useThemeInitializer()

  // Load auth token when app starts
  useEffect(() => {
    loadAuthTokenToAxios()
  }, [])

  if (!fontsLoaded) {
    return null // Or a loading indicator
  }

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode={isDark ? "dark" : "light"}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <NavigationContainer
          theme={{
            dark: isDark,
            colors: {
              primary: theme.primary[500],
              background: theme.background,
              card: theme.card,
              text: theme.text,
              border: theme.border,
              notification: theme.notification,
            },
            // @ts-ignore - fonts property is not actually required despite the type definition
            fonts: {},
          }}
        >
          <Stack.Navigator
            // @ts-ignore - id is not actually required despite the type definition
            id={undefined}
            screenOptions={getScreenOptions(isDark)}
          >
            <Stack.Screen
              name='Dashboard'
              options={{ headerShown: false }}
              component={DashboardStack}
            />
            <Stack.Screen
              name='Auth'
              component={AuthStack}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </GluestackUIProvider>
    </SafeAreaProvider>
  )
}
