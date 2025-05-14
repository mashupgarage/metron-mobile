import { StatusBar } from "expo-status-bar";
import "./global.css";
import { useFonts } from "expo-font";
import { InterFonts } from "./src/assets/fonts";
import { useColorScheme } from "react-native";
import { GluestackUIProvider } from "@/src/components/ui/gluestack-ui-provider";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStack } from "./src/navigation/AuthStack";
import { DashboardStack } from "./src/navigation/DashboardStack";
import { useBoundStore } from "./src/store";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { loadAuthTokenToAxios } from "./src/api/tokenManager";

const Stack = createNativeStackNavigator();

export default function App() {
  const store = useBoundStore();
  const [fontsLoaded] = useFonts(InterFonts);
  console.log(Constants.expoConfig.extra.apiUrl);
  useEffect(() => {
    loadAuthTokenToAxios();
  }, []);

  return (
    <SafeAreaProvider>
      <View
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          backgroundColor: useColorScheme() === "dark" ? "#202020" : "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {fontsLoaded && (
          <GluestackUIProvider mode="system">
            <NavigationContainer>
              <Stack.Navigator>
                <Stack.Screen
                  name="Dashboard"
                  options={{ headerShown: false }}
                  component={DashboardStack}
                />
                <Stack.Screen
                  name="Auth"
                  options={{ headerShown: false }}
                  component={AuthStack}
                />
              </Stack.Navigator>
            </NavigationContainer>
            <StatusBar style="auto" />
          </GluestackUIProvider>
        )}
      </View>
    </SafeAreaProvider>
  );
}
