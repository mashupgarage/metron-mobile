import { useBoundStore } from "@/src/store";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useEffect } from "react";

export default function Profile(props: { navigation: any }) {
  const store = useBoundStore();

  useEffect(() => {
    if (store.user === null) {
      props.navigation.replace("Auth", { screen: "SignIn" });
    }
  }, [store.user, props.navigation]);

  if (store.user === null) {
    return null; // or a loading spinner
  }

  return (
    <View style={styles.container}>
      <Text>Profile Screen</Text>
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
