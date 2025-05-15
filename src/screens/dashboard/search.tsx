import { Image } from "@/src/components/ui/image";
import { useBoundStore } from "@/src/store";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function Search() {
  const store = useBoundStore();
  return (
    <View style={styles.container}>
      <View className="flex flex-col items-center justify-center">
        <Text className="text-center">We're working on it 🙏</Text>
        <Image
          source={{
            uri: "https://i.namu.wiki/i/i8pFObUYpfyr8yr4pgmE0JMrvSnMGNN4fY5n3vTz4azQhS-IfDZ3txCoNTxpFTzR-eE2CyJZemmtkpa71ijVaA.gif",
          }}
          alt="scv_spinning"
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
