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
import { Box } from "@/src/components/ui/box";

const WantlistScreen = () => {
  const theme = useBoundStore((state) => state.theme);
  const deviceWidth = Dimensions.get("window").width;

  const [imgError, setImgError] = useState(false);
  const [isGrid, setIsGrid] = useState(true);
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
    background: theme.background,
    surface: theme.surface,
    text: theme.text,
    textSecondary: theme.textSecondary,
    border: theme.border,
    placeholder: theme.textSecondary,
    primary: theme.primary,
    error: theme.error,
    cardShadow: theme.gray[900],
    icon: theme.text,
    available: theme.success,
    outOfStock: theme.gray[500],
    button: theme.primary,
    buttonText: theme.text,
    yellowBg: theme.warning,
    yellowText: theme.white,
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
            backgroundColor: theme.primary[500],
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
      return null;
    }

    // Get cover URL
    const coverUrl = getCoverUrl(
      wantlistItem.product.cover_file_name,
      wantlistItem.product.id
    );
    const productId = wantlistItem.product.id;
    const isAvailable = wantlistItem.product?.quantity
      ? wantlistItem.product.quantity > 0
      : false;

    const handleAddToCart = async () => {
      try {
        if (!store.user?.id) {
          Alert.alert("Error", "You need to be logged in to add items to cart");
          return;
        }

        await addToCart(
          store.user.id,
          wantlistItem.product.id,
          wantlistItem.id
        );
        const res = await fetchCartItems(store.user.id);
        if (res?.data) {
          store.setCartItems(res.data);
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={"toast-" + id} action="success">
                <ToastTitle>Item added to cart</ToastTitle>
              </Toast>
            ),
          });
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={"toast-" + id} action="error">
              <ToastTitle>
                {error instanceof Error
                  ? error.message
                  : "Failed to add item to cart"}
              </ToastTitle>
            </Toast>
          ),
        });
      }
    };

    const navigateToProduct = () => {
      if (wantlistItem.product) {
        // @ts-ignore
        navigation.navigate("Product", {
          product: {
            ...wantlistItem.product,
            cover_url:
              wantlistItem.product.cover_url ||
              (wantlistItem.product.cover_file_name
                ? `https://assets.comic-odyssey.com/products/covers/medium/${wantlistItem.product.cover_file_name}`
                : ""),
          },
        });
      }
    };

    // Grid view item
    if (isGrid) {
      return (
        <Pressable
          key={`${wantlistItem.id}-${i}`}
          onPress={navigateToProduct}
          style={{
            width: "100%",
            aspectRatio: 2 / 3,
            padding: 4,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 8,
              overflow: "hidden",
              shadowColor: colors.cardShadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Image
              source={{ uri: coverUrl }}
              style={{
                width: "100%",
                height: 105,
                backgroundColor: colors.placeholder,
              }}
              resizeMode="cover"
            />
            <View style={{ padding: 8 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: "Urbanist-Bold",
                  fontSize: 14,
                  color: colors.text,
                  marginBottom: 2,
                }}
              >
                {wantlistItem.product.title}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: "PublicSans-Regular",
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginBottom: 4,
                }}
              >
                {wantlistItem.product.creators}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  onPress={handleAddToCart}
                  disabled={!isAvailable}
                  style={[
                    {
                      backgroundColor: isAvailable
                        ? colors.available
                        : colors.outOfStock,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                    },
                    !isAvailable && { opacity: 0.5 },
                  ]}
                >
                  <Text
                    style={{
                      color: theme.white,
                      fontSize: 12,
                      fontFamily: "Urbanist-SemiBold",
                    }}
                  >
                    {isAvailable ? "Add to Cart" : "Out of Stock"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Pressable>
      );
    }

    // List view item
    return (
      <Pressable
        key={`${wantlistItem.id}-${i}`}
        onPress={navigateToProduct}
        style={{
          flexDirection: "row",
          padding: 12,
          marginVertical: 4,
          marginHorizontal: 8,
          backgroundColor: colors.surface,
          borderRadius: 8,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Image
          source={{ uri: coverUrl }}
          style={{
            width: 60,
            height: 90,
            borderRadius: 4,
            backgroundColor: colors.placeholder,
            marginRight: 12,
          }}
          resizeMode="cover"
        />
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "Urbanist-Bold",
                fontSize: 16,
                color: colors.text,
                marginBottom: 4,
              }}
            >
              {wantlistItem.product.title}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "PublicSans-Regular",
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 4,
              }}
            >
              {wantlistItem.product.creators}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Urbanist-Bold",
                fontSize: 16,
                color: theme.text,
              }}
            >
              {wantlistItem.product.formatted_price ||
                wantlistItem.product.cover_price}
            </Text>
            <TouchableOpacity
              onPress={handleAddToCart}
              disabled={!isAvailable}
              style={[
                {
                  backgroundColor: isAvailable
                    ? colors.available
                    : colors.error,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 4,
                },
                !isAvailable && { opacity: 0.5 },
              ]}
            >
              <Text
                style={{
                  color: colors.buttonText,
                  fontSize: 14,
                  fontFamily: "Urbanist-SemiBold",
                }}
              >
                {isAvailable ? "Add to Cart" : "Out of Stock"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: theme.spacing.xl,
      }}
    >
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
        <View style={{ flex: 1, paddingHorizontal: 8 }}>
          <MasonryList
            data={wantlistItems}
            renderItem={({ item, i }) => {
              // Ensure item is of type ExtendedWantListItemT
              const listItem = item as ExtendedWantListItemT;
              return renderGridItem({ item: listItem, i });
            }}
            numColumns={3}
            contentContainerStyle={{
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreItems}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingMore && page < totalPages ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary[500]}
                  style={{ margin: 16 }}
                />
              ) : null
            }
          />
        </View>
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
                color={theme.primary[500]}
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
