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
  FlatList,
  TextInput,
  Dimensions,
} from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
import { useBoundStore } from "@/src/store";
import { getWantList, addToCart, fetchCartItems } from "@/src/api/apiEndpoints";
import { WantListItemT } from "@/src/utils/types/common";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Toast, ToastTitle, useToast } from "@/src/components/ui/toast";
import { LayoutGrid, LayoutList } from "lucide-react-native";
import NavigationHeader from "@/src/components/navigation-header";

const PAGE_SIZE = 20;

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
  const [isGrid, setIsGrid] = useState(true);
  const colorScheme = useColorScheme();
  const store = useBoundStore();
  const navigation = useNavigation();
  const toast = useToast();
  const [wantlistItems, setWantlistItems] = useState<ExtendedWantListItemT[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 1500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

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

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getWantList({
          page: 1,
          per: PAGE_SIZE,
          search: debouncedQuery || undefined,
          paginated: true,
        });
        console.log("res", res.data);
        const wantListData = res.data.want_lists || [];
        setWantlistItems(wantListData);
        setPage(1);
        setTotalPages(res.data.meta?.total_pages || 1);
        setTotalCount(res.data.meta?.total_count || wantListData.length);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch want list:", err);
        setError("Failed to load your want list. Please try again later.");
        setWantlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [store.user, navigation, debouncedQuery]);

  const loadMoreItems = async () => {
    if (isFetchingMore || page >= totalPages) return;
    setIsFetchingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getWantList({
        page: nextPage,
        per: PAGE_SIZE,
        search: debouncedQuery || undefined,
        paginated: true,
      });

      const newItems = res.data.want_lists || [];
      setWantlistItems((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const filtered = newItems.filter((item) => !existingIds.has(item.id));
        return [...prev, ...filtered];
      });
      setPage(nextPage);
      setTotalPages(res.data.meta?.total_pages || totalPages);
    } catch (err) {
      console.error("Failed to fetch more want list items:", err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  if (error) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.error, margin: 16, textAlign: "center" }}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setLoading(true);
            setError(null);
            getWantList({
              page: 1,
              per: PAGE_SIZE,
              search: debouncedQuery || undefined,
              paginated: true,
            })
              .then((res) => {
                const wantListData = res.data.want_lists || [];
                setWantlistItems(wantListData);
                setTotalPages(res.data.meta?.total_pages || 1);
                setTotalCount(
                  res.data.meta?.total_count || wantListData.length
                );
              })
              .catch((err) => {
                console.error("Retry failed:", err);
                setError("Failed to load your want list. Please try again.");
              })
              .finally(() => {
                setLoading(false);
              });
          }}
          style={{
            backgroundColor: colors.primary,
            padding: 12,
            borderRadius: 8,
            marginTop: 10,
          }}
        >
          <Text style={{ color: colors.buttonText, fontWeight: "600" }}>
            Retry
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Helper function to safely extract product data
  const getProductData = (item: ExtendedWantListItemT) => {
    if (!item || !item.product) {
      console.log("Missing product data for item:", item);
      return null;
    }
    return item.product;
  };

  const renderGridItem = ({
    item,
    i,
  }: {
    item: ExtendedWantListItemT;
    i: number;
  }) => {
    const wantlistItem = item;

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <NavigationHeader />

      {/* Header with title and view toggle */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.text }}>
          Want List
        </Text>
        <TouchableOpacity
          style={{ padding: 8, borderRadius: 999 }}
          onPress={() => setIsGrid((prev) => !prev)}
        >
          {isGrid ? (
            <LayoutList size={24} color={colors.icon} />
          ) : (
            <LayoutGrid size={24} color={colors.icon} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={{ position: "relative" }}>
          <TextInput
            placeholder="Search by title..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
              paddingRight: 36,
            }}
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: 10,
                top: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: 28,
              }}
              accessibilityLabel="Clear search"
            >
              <Text style={{ fontSize: 18, color: colors.textSecondary }}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Information Banner */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View
          style={{
            backgroundColor: colors.yellowBg,
            borderRadius: 8,
            padding: 12,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: colors.yellowText,
              lineHeight: 20,
            }}
          >
            This is your want list. You'll be notified when items become
            available. Products are first come, first served.
          </Text>
        </View>
      </View>

      {/* Main Content */}
      {isGrid ? (
        <MasonryList
          data={wantlistItems}
          renderItem={({ item, i }) => {
            const product = getProductData(item as ExtendedWantListItemT);
            return product
              ? renderGridItem({ item: item as ExtendedWantListItemT, i })
              : null;
          }}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreItems}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore && page < totalPages ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ margin: 16 }}
              />
            ) : null
          }
        />
      ) : (
        <FlatList
          data={wantlistItems}
          renderItem={({ item, index }) => {
            const product = getProductData(item);
            return product ? renderGridItem({ item, i: index }) : null;
          }}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreItems}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore && page < totalPages ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ margin: 16 }}
              />
            ) : null
          }
        />
      )}

      {/* Item count footer */}
      <View style={{ alignItems: "center", marginVertical: 8 }}>
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
          Showing {Math.min(wantlistItems.length, totalCount)} of {totalCount}{" "}
          items
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default WantlistScreen;
