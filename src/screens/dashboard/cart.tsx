import { Button, ButtonText } from "@/src/components/ui/button";
import { useBoundStore } from "@/src/store";
import { StatusBar } from "expo-status-bar";
import { Text, View, FlatList, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CartItemT } from "@/src/utils/types/common";
import { Box } from "@/src/components/ui/box";
import { Image } from "@/src/components/ui/image";
import { Trash2, CheckIcon } from "lucide-react-native";
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
import { useToast } from "@gluestack-ui/themed";
import { Toast, ToastTitle } from "@/src/components/ui/toast";

export default function Cart() {
  const store = useBoundStore();
  const isDark = useBoundStore((state) => state.isDark);
  const theme = useBoundStore((state) => state.theme);
  const navigation = useNavigation();
  const toast = useToast();
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (store.user !== null) {
      fetchCartItems(store.user.id)
        .then((res) => {
          store.setCartItems(res.data);
        })
        .catch((err) => {
          console.log("cart items error", err);
        });
    }
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
      toast.show({
        placement: "top",
        render: ({ id }) => {
          const toastId = "toast-" + id;
          return (
            <Toast nativeID={toastId} action="info">
              <ToastTitle>
                Checkout functionality to be implemented soon
              </ToastTitle>
            </Toast>
          );
        },
      });
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
    <Box
      style={{
        borderColor: theme.border,
      }}
      className={`flex-row items-center p-2 border-b`}
    >
      <Checkbox
        aria-label={`Select item ${item.product.title}`}
        value={item.id.toString()}
        style={{
          borderColor: theme.border,
          backgroundColor: theme.background,
        }}
        isChecked={selectedItems.has(item.id)}
        onChange={() => toggleItemSelection(item.id)}
        className="mr-2 p-2"
      >
        <CheckboxIndicator>
          <CheckboxIconComponent
            style={{ color: theme.primary[500] }}
            as={CheckIcon}
          />
        </CheckboxIndicator>

        <Image
          source={{ uri: item.product.cover_url_large }}
          className="w-24 h-24 mr-2"
          alt={item.product.title}
        />
        <View className="flex-1">
          <Text
            style={{ fontFamily: "Urbanist-Bold", color: theme.text }}
            className={`font-semibold`}
          >
            {item.product.title}
          </Text>
          <Text
            style={{
              fontFamily: "PublicSans-regular",
              marginTop: 8,
              color: theme.text,
            }}
            className={`font-semibold`}
          >
            NM: {item.product_item_id}
          </Text>
          <Text
            style={{
              fontFamily: "PublicSans-regular",
              marginTop: 4,
              color: theme.text,
            }}
            className={`font-semibold`}
          >
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
          <Trash2 size={18} color={theme.error} />
        </Button>
      </Checkbox>
    </Box>
  );

  const totalSelectedItems = selectedItems.size;
  return (
    <SafeAreaView className={`flex-1 bg-[${theme.background}]`}>
      <StatusBar style={isDark === true ? "light" : "dark"} />
      <Text
        style={{ fontFamily: "Urbanist-Bold", color: theme.text }}
        className={`text-2xl font-bold m-4 text-left`}
      >
        Your Cart{" "}
        {groupedCartItems.length !== 0 && `(${groupedCartItems.length} items)`}
      </Text>
      <View className="flex-1">
        {groupedCartItems.length === 0 ? (
          <Text
            style={{ fontFamily: "PublicSans-regular", color: theme.text }}
            className="mt-12 text-lg  text-center"
          >
            Your cart is empty.
          </Text>
        ) : (
          <FlatList
            data={groupedCartItems}
            renderItem={({ item }) => renderItem({ item })}
            keyExtractor={(item) => item.id.toString()}
            className="flex-1 w-full"
            contentContainerStyle={{ paddingBottom: 96 }}
          />
        )}
      </View>
      {groupedCartItems.length > 0 && (
        <View
          style={{ backgroundColor: theme.background }}
          className={`absolute left-0 right-0 bottom-0 pb-4 pt-2 items-center`}
        >
          <View className="flex-row mx-1">
            <Button
              onPress={handleCheckout}
              size="xl"
              style={{ backgroundColor: theme.primary[900] }}
              isDisabled={selectedItems.size === 0}
              disabled={selectedItems.size === 0}
              className="flex-1"
            >
              <ButtonText
                style={{ fontFamily: "PublicSans-regular", color: theme.white }}
              >
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
