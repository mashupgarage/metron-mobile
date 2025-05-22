import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  Alert,
} from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
import { useBoundStore } from "@/src/store";
import { getWantList, addToCart, fetchCartItems } from "@/src/api/apiEndpoints";
import { WantListItemT } from "@/src/utils/types/common";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Toast, ToastTitle, useToast } from "@/src/components/ui/toast";

// Helper function to construct image URL from cover_file_name
const getCoverUrl = (
  coverFileName: string | undefined,
  productId?: number
): string => {
  if (!coverFileName) return "";

  // Try format with just the filename
  return `https://assets.comic-odyssey.com/products/covers/medium/${coverFileName}`;
};

// Extended product type that includes quantity
interface ExtendedProduct {
  id: number;
  title: string;
  cover_price?: string;
  price?: string;
  formatted_price?: string;
  creators?: string;
  cover_file_name?: string;
  cover_content_type?: string;
  cover_file_size?: number;
  cover_updated_at?: string;
  description?: string;
  issue_number?: string;
  quantity?: number;
  cover_url?: string;
}

// Extended WantListItem type
interface ExtendedWantListItemT extends Omit<WantListItemT, "product"> {
  product?: ExtendedProduct;
}

import { useColorScheme } from "react-native";

const WantlistScreen = () => {
  const colorScheme = useColorScheme();
  const store = useBoundStore();
  const navigation = useNavigation();
  const toast = useToast();
  const [wantlistItems, setWantlistItems] = useState<ExtendedWantListItemT[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!store.user) {
      // @ts-ignore
      navigation.replace("Auth", { screen: "SignIn" });
      return;
    }

    setLoading(true);
    getWantList()
      .then((res) => {
        // Log the response to check the structure
        console.log(
          "Want List API Response:",
          JSON.stringify(res.data.want_lists[0])
        );

        // Set the entire want_lists array as our data, properly cast to ExtendedWantListItemT
        setWantlistItems(res.data.want_lists as ExtendedWantListItemT[]);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch want list:", err);
        setError("Failed to load your want list. Please try again later.");
        setWantlistItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [store.user, navigation]);

  if (loading) {
    return (
      <SafeAreaView
        className={`flex-1 justify-center items-center ${
          colorScheme === "dark" ? "bg-mdark-background" : "bg-white"
        }`}
      >
        <Text
          className={
            colorScheme === "dark" ? "text-mdark-text" : "text-gray-900"
          }
        >
          Loading your want list...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        className={`flex-1 ${
          colorScheme === "dark" ? "bg-mdark-background" : "bg-white"
        }`}
      >
        <Text
          className={
            colorScheme === "dark" ? "text-mdark-text" : "text-red-500"
          }
        >
          {error}
        </Text>
      </SafeAreaView>
    );
  }

  if (wantlistItems.length === 0) {
    return (
      <SafeAreaView
        className={`flex-1 ${
          colorScheme === "dark" ? "bg-mdark-background" : "bg-white"
        }`}
      >
        <Text
          className={
            colorScheme === "dark" ? "text-mdark-text" : "text-gray-900"
          }
        >
          Your want list is empty.
        </Text>
        <Text
          className={
            colorScheme === "dark" ? "text-mdark-text" : "text-gray-900"
          }
        >
          Add items you want by tapping "I want this" on product pages.
        </Text>
      </SafeAreaView>
    );
  }

  const renderGridItem = ({ item, i }: { item: unknown; i: number }) => {
    const wantlistItem = item as ExtendedWantListItemT;

    // Check if item has product
    if (!wantlistItem.product) {
      console.log("Missing product for item:", wantlistItem);
      return null; // Skip rendering this item
    }

    // Get cover URL
    const coverUrl = getCoverUrl(
      wantlistItem.product.cover_file_name,
      wantlistItem.product.id
    );
    const productId = wantlistItem.product.id;
    const hasImageError = imageErrors[productId] || !coverUrl;

    // Check if product is available (safely check with optional chaining)
    const isAvailable = wantlistItem.product?.quantity
      ? wantlistItem.product.quantity > 0
      : false;

    // Log for debugging
    if (!coverUrl) {
      console.log(
        "Cannot construct image URL because cover_file_name is missing:",
        wantlistItem.product.title
      );
    }

    const handleAddToCart = async () => {
      try {
        if (!store.user || !store.user.id) {
          Alert.alert("Error", "You need to be logged in to add items to cart");
          return;
        }

        await addToCart(
          store.user.id,
          wantlistItem.product.id,
          wantlistItem.id
        ).then(async () => {
          const res = await fetchCartItems(store.user.id);
          if (res?.data) {
            store.setCartItems(res.data);
            toast.show({
              placement: "top",
              render: ({ id }) => {
                const toastId = "toast-" + id;
                return (
                  <Toast nativeID={toastId} action="success">
                    <ToastTitle>Successfully added to cart!</ToastTitle>
                  </Toast>
                );
              },
            });
          }
        });
      } catch (error) {
        // Enhanced error logging
        console.error("Failed to add to cart. Details:", {
          error: error,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          errorName: error instanceof Error ? error.name : "Unknown error type",
          productId: wantlistItem.product.id,
          productTitle: wantlistItem.product.title,
          userId: store.user?.id,
        });

        Alert.alert(
          "Error",
          `Failed to add item to cart: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    };

    return (
      <Pressable
        className={`m-2 rounded-xl overflow-hidden bg-mdark-surface shadow-md flex-1`}
        onPress={() => {
          if (wantlistItem.product) {
            // Create a sanitized copy of the product with a valid cover_url
            const sanitizedProduct = {
              ...wantlistItem.product,
              // Ensure cover_url is a valid string URL
              cover_url:
                typeof wantlistItem.product.cover_url === "string" &&
                wantlistItem.product.cover_url.trim() !== ""
                  ? wantlistItem.product.cover_url
                  : wantlistItem.product.cover_file_name
                  ? `https://assets.comic-odyssey.com/products/covers/medium/${wantlistItem.product.cover_file_name}`
                  : "",
            };

            // @ts-ignore
            navigation.navigate("Product", {
              product: sanitizedProduct,
            });
          }
        }}
      >
        {hasImageError ? (
          // Show placeholder when there's an error or no URL
          <View className="w-full h-44 items-center justify-center bg-gray-100 dark:bg-mdark-surface rounded-xl">
            <Image
              source={require("@/src/assets/icon.png")}
              className="w-20 h-20 opacity-60"
              resizeMode="contain"
            />
          </View>
        ) : (
          // Try to load actual image
          <Image
            source={{ uri: coverUrl }}
            className="w-full h-44 rounded-t-xl"
            resizeMode="cover"
            onError={() => {
              console.log("Image failed to load:", coverUrl);
              setImageErrors((prev) => ({ ...prev, [productId]: true }));
            }}
          />
        )}
        <View className="p-3">
          <Text
            className={`text-lg font-bold mb-1 ${
              colorScheme === "dark" ? "text-mdark-text" : "text-gray-900"
            }`}
            numberOfLines={1}
          >
            {wantlistItem.product.title}
          </Text>
          <Text
            className={`text-base font-semibold mb-1 ${
              colorScheme === "dark"
                ? "text-mdark-textSecondary"
                : "text-gray-600"
            }`}
          >
            {wantlistItem.product.cover_price
              ? `$${wantlistItem.product.cover_price}`
              : "Price unavailable"}
          </Text>
          {wantlistItem.product.creators && (
            <Text className="text-xs text-gray-400 mb-1" numberOfLines={1}>
              {wantlistItem.product.creators}
            </Text>
          )}
          {wantlistItem.product.issue_number && (
            <Text className="text-xs text-gray-400 mb-1">
              Issue: {wantlistItem.product.issue_number}
            </Text>
          )}

          {/* Availability indicator and Add to Cart button */}
          <View className="flex-row justify-between items-center mt-2">
            <Text
              className={
                isAvailable
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }
            >
              {isAvailable ? "Available" : "Out of Stock"}
            </Text>

            {isAvailable && (
              <TouchableOpacity
                className="mt-0 px-2 py-1 rounded-lg "
                onPress={handleAddToCart}
              >
                <Text className="text-white font-bold text-center">
                  Add to Cart
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      className={`flex-1 pt-4 ${
        colorScheme === "dark" ? "bg-mdark-background" : "bg-white"
      }`}
    >
      <StatusBar style="auto" />
      {/* Information Section */}
      <View className="px-4 pt-2 pb-4">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity
            className="p-2 rounded-full"
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colorScheme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>
        <Text
          className={`text-xs mb-2 ${
            colorScheme === "dark"
              ? "text-mdark-textSecondary"
              : "text-gray-600"
          }`}
        >
          This is your want list. Visit this page regularly to view the status
          of your want list. You will also get notified as soon as the product
          becomes available.
        </Text>
        <View className="bg-yellow-100 dark:bg-yellow-900 rounded-md p-2 mt-2">
          <Text className="text-xs text-yellow-700 dark:text-yellow-200">
            Please note that products are first pay, first serve basis.
          </Text>
        </View>
      </View>

      <MasonryList
        data={wantlistItems}
        renderItem={renderGridItem}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default WantlistScreen;
