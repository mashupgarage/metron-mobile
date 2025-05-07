import { Box } from "@/src/components/ui/box";
import { Text } from "@/src/components/ui/text";
import { Image } from "@/src/components/ui/image";
import { useColorScheme } from "react-native";
import { HStack } from "@/src/components/ui/hstack";
import { Button } from "@/src/components/ui/button";
import { WebView } from "react-native-webview";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { DashboardStackParams } from "@/src/utils/types/navigation";
import { useState } from "react";
import { ActivityIndicator, StatusBar } from "react-native";

export default function CGCSubmit() {
  const navigation = useNavigation<NavigationProp<DashboardStackParams>>();
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);

  const airtableFormUrl =
    "https://airtable.com/embed/shrT4lMxb7MTqp71v?backgroundColor=cyan";

  return (
    <Box className="h-screen w-full pb-4">
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <HStack className="items-start pt-12 pr-2">
        <Box className="flex-row items-center">
          <Button
            onPress={() => navigation.goBack()}
            variant="link"
            className="p-2"
          >
            <Text className="text-primary-500 font-semibold">Back</Text>
          </Button>
        </Box>
      </HStack>

      <Box className="items-center justify-start">
        <Image
          source={require("@/src/assets/cgc-submit.png")}
          alt="CGC Submit"
          className="w-full h-64 rounded-lg"
          resizeMode="contain"
        />
      </Box>

      <Box className="flex-1 mx-2 mb-2">
        {isLoading && (
          <Box className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center z-10">
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className="mt-2">Loading submission form...</Text>
          </Box>
        )}

        <WebView
          source={{ uri: airtableFormUrl }}
          onLoad={() => setIsLoading(false)}
          style={{ borderRadius: 8 }}
        />
      </Box>
    </Box>
  );
}
