import { Button, ButtonText } from "@/src/components/ui/button";
import { useBoundStore } from "@/src/store";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProductT } from "@/src/utils/types/common";
import { Box } from "@/src/components/ui/box";
import { Image } from "@/src/components/ui/image";
import {
  Trash2,
  MinusCircle,
  PlusCircle,
  CheckIcon,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon as CheckboxIconComponent,
} from "@/src/components/ui/checkbox";

export default function Cart() {
  const store = useBoundStore();
  const navigation = useNavigation();
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const groupedCartItems = store.cartItems.reduce((acc, item) => {
    const existingItem = acc.find((i) => i.id === item.id);
    if (existingItem) {
      existingItem.cartQuantity += 1;
    } else {
      acc.push({ ...item, cartQuantity: 1 });
    }
    return acc;
  }, [] as (ProductT & { cartQuantity: number })[]);

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prevSelectedItems) => {
      const newSelectedItems = new Set(prevSelectedItems);
      if (newSelectedItems.has(itemId)) {
        newSelectedItems.delete(itemId);
      } else {
        newSelectedItems.add(itemId);
      }
      return newSelectedItems;
    });
  };

  const handleRemoveCompletely = (productId: number) => {
    store.removeAllOfItemFromCart(productId);
    setSelectedItems((prevSelectedItems) => {
      const newSelectedItems = new Set(prevSelectedItems);
      newSelectedItems.delete(productId);
      return newSelectedItems;
    });
  };

  const handleIncrease = (item: ProductT) => {
    store.increaseItemQuantity(item.id);
  };

  const handleDecrease = (item: ProductT) => {
    store.decreaseItemQuantity(item.id);
  };

  const handleCheckout = () => {
    const itemsToCheckout = groupedCartItems
      .filter((item) => selectedItems.has(item.id))
      .map((item) => ({
        id: item.id,
        quantity: item.cartQuantity,
      }));

    if (itemsToCheckout.length === 0) {
      console.log("No items selected for checkout.");
      alert("Please select items to checkout.");
      return;
    }

    if (store.user) {
      console.log("Checkout Selected Items:", itemsToCheckout);
      // TODO: Implement actual checkout logic (e.g., navigate to checkout flow) with itemsToCheckout
    } else {
      console.log("User not authenticated, redirecting to Auth stack...");
      navigation.navigate("Auth" as never);
    }
  };

  const renderItem = ({
    item,
  }: {
    item: ProductT & { cartQuantity: number };
  }) => (
    <Box className="flex-row items-center p-2 border-b border-gray-200">
      <Checkbox
        aria-label={`Select item ${item.title}`}
        value={item.id.toString()}
        isChecked={selectedItems.has(item.id)}
        onChange={() => toggleItemSelection(item.id)}
        className="mr-2 p-2"
      >
        <CheckboxIndicator>
          <CheckboxIconComponent as={CheckIcon} />
        </CheckboxIndicator>

        <Image
          source={{ uri: item.cover_url_large }}
          className="w-16 h-24 mr-2"
          alt={item.title}
        />
        <View style={{ flex: 1 }}>
          <Text className="font-semibold">{item.title}</Text>
          <Text>Price: {item.formatted_price}</Text>
          <Box className="flex-row items-center mt-1">
            <Text>Quantity: </Text>
            <Button
              variant="link"
              size="md"
              className="p-1"
              onPress={() => handleDecrease(item)}
            >
              <MinusCircle size={20} color="gray" />
            </Button>
            <Text className="mx-2 w-6 text-center">{item.cartQuantity}</Text>
            <Button
              variant="link"
              size="md"
              className="p-1"
              onPress={() => handleIncrease(item)}
              disabled={item.cartQuantity >= (item.quantity ?? 0)}
            >
              <PlusCircle size={20} color={"gray"} />
            </Button>
          </Box>
        </View>
        <Button
          size="xs"
          variant="link"
          className="p-2 ml-auto self-center"
          onPress={() => handleRemoveCompletely(item.id)}
        >
          <Trash2 size={18} color="red" />
        </Button>
      </Checkbox>
    </Box>
  );

  const totalSelectedItems = selectedItems.size;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        Your Cart{" "}
        {groupedCartItems.length !== 0 && `(${groupedCartItems.length} items)`}
      </Text>
      <View style={styles.contentWrapper}>
        {groupedCartItems.length === 0 ? (
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        ) : (
          <FlatList
            data={groupedCartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            contentContainerStyle={{ paddingBottom: 96 }} // add space for footer
          />
        )}
      </View>
      {groupedCartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={{ flexDirection: "row", marginHorizontal: 4 }}>
            <Button
              onPress={handleCheckout}
              size="xl"
              disabled={selectedItems.size === 0}
              style={{ flex: 1 }}
            >
              <ButtonText className="text-md">
                Checkout ({totalSelectedItems} Selected)
              </ButtonText>
            </Button>
          </View>
        </View>
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 16,
    textAlign: "left",
  },
  contentWrapper: {
    flex: 1,
  },
  list: {
    flex: 1,
    width: "100%",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    paddingBottom: 16,
    paddingTop: 8,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 50,
    fontSize: 16,
    color: "gray",
    textAlign: "center",
  },
});
