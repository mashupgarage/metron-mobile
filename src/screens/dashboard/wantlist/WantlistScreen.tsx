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

  // Centralized color palette for light/dark mode
  const colors = {
    background: colorScheme === "dark" ? "#181A20" : "#FFFFFF",
    surface: colorScheme === "dark" ? "#23262F" : "#F3F4F6",
    text: colorScheme === "dark" ? "#F3F4F6" : "#181A20",
    textSecondary: colorScheme === "dark" ? "#B5B5B5" : "#6B7280",
    border: colorScheme === "dark" ? "#23262F" : "#E5E7EB",
    placeholder: colorScheme === "dark" ? "#444857" : "#E5E7EB",
    primary: "#3B82F6",
    error: "#EF4444",
    cardShadow: colorScheme === "dark" ? "#000000" : "#D1D5DB",
    icon: colorScheme === "dark" ? "#FFFFFF" : "#181A20",
    available: colorScheme === "dark" ? "#4ADE80" : "#16A34A", // green-400/green-600
    outOfStock: colorScheme === "dark" ? "#F87171" : "#DC2626", // red-400/red-600
    button: colorScheme === "dark" ? "#3B82F6" : "#2563EB", // blue-500/blue-700
    buttonText: colorScheme === "dark" ? "#FFFFFF" : "#181A20",
    yellowBg: colorScheme === "dark" ? "#78350F" : "#FEF3C7",
    yellowText: colorScheme === "dark" ? "#FDE68A" : "#92400E",
  };

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
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.text }}>Loading your want list...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Text style={{ color: colors.error, margin: 16 }}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (wantlistItems.length === 0) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.text, marginBottom: 8 }}>
          Your want list is empty.
        </Text>
        <Text style={{ color: colors.textSecondary }}>
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
        style={{
          margin: 8,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: colors.surface,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          flex: 1,
        }}
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
          <View
            style={{
              width: "100%",
              height: 176,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.placeholder,
              borderRadius: 16,
            }}
          >
            <Image
              source={require("@/src/assets/icon.png")}
              style={{ width: 80, height: 80, opacity: 0.6 }}
              resizeMode="contain"
            />
          </View>
        ) : (
          // Try to load actual image
          <Image
            source={{ uri: coverUrl }}
            style={{
              width: "100%",
              height: 176,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
            resizeMode="cover"
            onError={() => {
              setImageErrors((prev) => ({ ...prev, [productId]: true }));
            }}
          />
        )}
        <View style={{ padding: 12 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 4,
              color: colors.text,
            }}
            numberOfLines={1}
          >
            {wantlistItem.product.title}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 4,
              color: colors.textSecondary,
            }}
          >
            {wantlistItem.product.cover_price
              ? `$${wantlistItem.product.cover_price}`
              : "Price unavailable"}
          </Text>
          {wantlistItem.product.creators && (
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {wantlistItem.product.creators}
            </Text>
          )}
          {wantlistItem.product.issue_number && (
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginBottom: 4,
              }}
            >
              Issue: {wantlistItem.product.issue_number}
            </Text>
          )}

          {/* Availability indicator and Add to Cart button */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: isAvailable ? colors.available : colors.outOfStock,
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              {isAvailable ? "Available" : "Out of Stock"}
            </Text>

            {isAvailable && (
              <TouchableOpacity
                style={{
                  marginTop: 0,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
                onPress={handleAddToCart}
              >
                <Text
                  style={{
                    color: colors.buttonText,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
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
      style={{ flex: 1, paddingTop: 16, backgroundColor: colors.background }}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      {/* Information Section */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <TouchableOpacity
            style={{ padding: 8, borderRadius: 999 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.icon} />
          </TouchableOpacity>
        </View>
        <Text
          style={{ fontSize: 12, marginBottom: 8, color: colors.textSecondary }}
        >
          This is your want list. Visit this page regularly to view the status
          of your want list. You will also get notified as soon as the product
          becomes available.
        </Text>
        <View
          style={{
            backgroundColor: colors.yellowBg,
            borderRadius: 8,
            padding: 8,
            marginTop: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.yellowText }}>
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
