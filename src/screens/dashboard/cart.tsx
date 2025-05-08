import { Button, ButtonText } from "@/src/components/ui/button";
import { useBoundStore } from "@/src/store";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProductT, CartItemT } from "@/src/utils/types/common";
import { Box } from "@/src/components/ui/box";
import { Image } from "@/src/components/ui/image";
import {
  Trash2,
  MinusCircle,
  PlusCircle,
  CheckIcon,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon as CheckboxIconComponent,
} from "@/src/components/ui/checkbox";
import {
  fetchCartItems,
  addToCart,
  removeFromCart,
} from "@/src/api/apiEndpoints";

export default function Cart() {
  const store = useBoundStore();
  const navigation = useNavigation();
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    console.log("fetching cart....", store.cartItems);
    fetchCartItems(store.user.id)
      .then((res) => {
        console.log("cart items", res.data);
        store.setCartItems(res.data);
      })
      .catch((err) => {
        console.log("cart items error", err);
      });
  }, []);

  // Each cart item from the backend is already unique, so just add cartQuantity = 1 for each
  const groupedCartItems = (store.cartItems as CartItemT[]).map((item) => ({
    ...item,
    cartQuantity: 1,
  }));

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

  const handleRemoveCompletely = async (cartItemId: number) => {
    if (!store.user || !store.user.id) {
      alert("You must be logged in to remove items from the cart.");
      navigation.navigate("Auth" as never);
      return;
    }
    try {
      await removeFromCart(store.user.id, cartItemId);
      const res = await fetchCartItems(store.user.id);
      if (res?.data) {
        store.setCartItems(res.data);
      }
      setSelectedItems((prevSelectedItems) => {
        const newSelectedItems = new Set(prevSelectedItems);
        newSelectedItems.delete(cartItemId);
        return newSelectedItems;
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
      alert("Failed to remove item from cart. Please try again.");
    }
  };

  const [addingProductId, setAddingProductId] = useState<number | null>(null);

  const handleIncrease = async (item: CartItemT) => {
    if (!store.user) {
      alert("You must be logged in to add items to the cart.");
      navigation.navigate("Auth" as never);
      return;
    }
    if (!item.product_item_id) {
      alert("Missing product item ID. Please try again.");
      return;
    }
    setAddingProductId(item.id);
    try {
      const res = await addToCart(store.user.id, item.id, item.product_item_id);
      // Assuming API returns the updated cart items array
      if (res?.data) {
        store.setCartItems(res.data);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    } finally {
      setAddingProductId(null);
    }
  };

  const handleDecrease = (item: CartItemT) => {
    // TODO: Update to use API endpoint for decreasing/removing from cart
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
    item: CartItemT & { cartQuantity: number };
  }) => (
    <Box className="flex-row items-center p-2 border-b border-gray-200">
      <Checkbox
        aria-label={`Select item ${item.product.title}`}
        value={item.id.toString()}
        isChecked={selectedItems.has(item.id)}
        onChange={() => toggleItemSelection(item.id)}
        className="mr-2 p-2"
      >
        <CheckboxIndicator>
          <CheckboxIconComponent as={CheckIcon} />
        </CheckboxIndicator>

        <Image
          source={{ uri: item.product.cover_url_large }}
          className="w-16 h-24 mr-2"
          alt={item.product.title}
        />
        <View style={{ flex: 1, marginTop: 24 }}>
          <Text className="font-semibold">{item.product.title}</Text>
          <Text>NM: {item.product_item_id}</Text>
          <Text>
            Price:{" "}
            {item.product.formatted_price ||
              "₱" + Number(item.price).toFixed(2)}
          </Text>
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
            renderItem={({ item }) => renderItem({ item })}
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
