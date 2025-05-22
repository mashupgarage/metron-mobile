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
import { loadAuthTokenToAxios } from "./src/api/tokenManager";
import { config } from "./src/components/ui/gluestack-ui-provider/config";

const Stack = createNativeStackNavigator();

export default function App() {
  const store = useBoundStore();
  const [fontsLoaded] = useFonts(InterFonts);
  useEffect(() => {
    console.log("fontsLoaded", fontsLoaded);
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
              <Stack.Navigator id={undefined}>
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
