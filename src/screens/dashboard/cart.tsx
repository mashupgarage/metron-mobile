import { Button, ButtonText } from "@/src/components/ui/button";
import { useBoundStore } from "@/src/store";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function Cart() {
  const store = useBoundStore();
  return (
    <View style={styles.container}>
      <Text>Cart Screen</Text>
      <Button
        onPress={() => {
          store.setCartCount(Number(store.cartCount) + 1);
          console.log(store.cartCount);
        }}
      >
        <ButtonText>Increment cart count</ButtonText>
      </Button>
      <Button
        className="mt-2"
        onPress={() => {
          store.setCartCount(0);
        }}
      >
        <ButtonText>reset cart count</ButtonText>
      </Button>
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
