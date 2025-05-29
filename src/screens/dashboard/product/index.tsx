import React from "react";
import { Box } from "@/src/components/ui/box";
import { Text } from "@/src/components/ui/text";
import { Image } from "@/src/components/ui/image";
import { useBoundStore } from "@/src/store";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  View,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  ScrollView,
  Pressable,
} from "react-native";
import { Button } from "@/src/components/ui/button";
import { useNavigation } from "@react-navigation/native";
import { ProductT } from "@/src/utils/types/common";
import { useToast, Toast, ToastTitle } from "@/src/components/ui/toast";
import NavigationHeader from "@/src/components/navigation-header";
import { Download, Heart, ShoppingCart, ZoomIn } from "lucide-react-native";
import {
  addToReservation,
  addToWantList,
  getWantList,
  addToCart,
  fetchCartItems,
  fetchProductDetails,
} from "@/src/api/apiEndpoints";
import { VStack } from "@gluestack-ui/themed";

import {
  useProductOwned,
  useProductSeriesStatus,
  useProductRecommendations,
} from "./productHooks";
import ProductCard from "@/src/components/product";

export default function Product(props: {
  route: {
    params: {
      product: ProductT;
      fromReservations?: boolean;
      reservationId?: number;
      reservationList?: any[];
    };
  };
}) {
  const colorScheme = useColorScheme();
  const { route } = props;
  const { params } = route;
  const { product, fromReservations, reservationId, reservationList } = params;

  // Custom hooks for product data
  const { data: ownedData, loading: ownedLoading } = useProductOwned(
    product.id
  );

  const { data: seriesStatus, loading: seriesLoading } = useProductSeriesStatus(
    product.id
  );
  const { data: recommendations, loading: recsLoading } =
    useProductRecommendations(product.id);

  // Local state for reservation list so we can update it after reservation
  const [localReservationList, setLocalReservationList] = React.useState<any[]>(
    reservationList || []
  );

  // Check if this product is already reserved in the user's reservation list
  const isAlreadyReserved = Array.isArray(localReservationList)
    ? localReservationList.some((r) => r.product?.id === product.id)
    : false;

  const [productItems, setProductItems] = React.useState<any[]>([]);
  const [selectedProductItemId, setSelectedProductItemId] = React.useState<
    number | null
  >(null);
  const [quantity, setQuantity] = React.useState(1);
  const [quantityError, setQuantityError] = React.useState(false);

  // Only count available NM items for cart logic
  const availableNMItems = productItems.filter(
    (item) => item.available && item.condition === "NM"
  );
  const maxQuantity = availableNMItems.length;
  const isQuantityValid = quantity >= 1 && quantity <= maxQuantity;

  const store = useBoundStore();
  const navigation = useNavigation();
  const toast = useToast();
  const [isWanted, setIsWanted] = React.useState(false);

  React.useEffect(() => {
    // Fetch product details to get normalized_product_items
    fetchProductDetails(product.id)
      .then((res) => {
        const details = res.data;
        // Flatten all product items from normalized_product_items
        let items: any[] = [];
        if (details.normalized_product_items) {
          Object.values(details.normalized_product_items).forEach(
            (arr: any) => {
              items = items.concat(arr);
            }
          );
        }
        setProductItems(items);
        // Pick the first available item as default
        const firstAvailable = items.find((item) => item.available);
        setSelectedProductItemId(firstAvailable ? firstAvailable.id : null);
      })
      .catch(() => {
        setProductItems([]);
        setSelectedProductItemId(null);
      });
  }, [product.id]);

  React.useEffect(() => {
    getWantList()
      .then((res) => {
        const ids = res.data.want_lists.map((item: any) => item.product_id);
        setIsWanted(ids.includes(product.id));
      })
      .catch(() => setIsWanted(false));
  }, [product.id]);

  const handleAddToCart = async () => {
    if (!store.user || !store.user.id) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="error">
            <ToastTitle>You need to be logged in to add to cart.</ToastTitle>
          </Toast>
        ),
      });
      navigation.navigate("Auth" as never);
      return;
    }
    if (maxQuantity === 0) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="error">
            <ToastTitle>Product out of stock or invalid.</ToastTitle>
          </Toast>
        ),
      });
      return;
    }
    if (!isQuantityValid) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="error">
            <ToastTitle>
              Not enough available NM items to add to cart.
            </ToastTitle>
          </Toast>
        ),
      });
      return;
    }
    try {
      // Add the first N NM product items to the cart
      for (let i = 0; i < quantity; i++) {
        await addToCart(store.user.id, product.id, availableNMItems[i].id);
      }
      // Fetch the updated cart from backend
      const res = await fetchCartItems(store.user.id);
      if (res?.data) {
        store.setCartItems(res.data);
      }
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
    } catch (error) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="error">
            <ToastTitle>Failed to add to cart.</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  // Reservation handler for reservations entry point
  const handleAddToReservation = () => {
    if (fromReservations && isAlreadyReserved) {
      toast.show({
        placement: "top",
        render: ({ id }) => {
          const toastId = "toast-" + id;
          return (
            <Toast nativeID={toastId} action="error">
              <ToastTitle>This product is already reserved!</ToastTitle>
            </Toast>
          );
        },
      });
      return;
    }
    if (maxQuantity > 0 && isQuantityValid) {
      addToReservation(product.id, quantity, reservationId)
        .then((res) => {
          // Dynamically update localReservationList so button disables and count updates
          setLocalReservationList((prev) => [
            ...prev,
            {
              ...res.data.reservation,
              product,
            },
          ]);
          toast.show({
            placement: "top",
            render: ({ id }) => {
              const toastId = "toast-" + id;
              return (
                <Toast nativeID={toastId} action="success">
                  <ToastTitle>Reserved product!</ToastTitle>
                </Toast>
              );
            },
          });
        })
        .catch(() => {
          toast.show({
            placement: "top",
            render: ({ id }) => {
              const toastId = "toast-" + id;
              return (
                <Toast nativeID={toastId} action="error">
                  <ToastTitle>Failed to reserve product!</ToastTitle>
                </Toast>
              );
            },
          });
        });
    } else {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="error">
            <ToastTitle>Product out of stock or invalid.</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#121212" : "#ffffff",
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 32 : 0}
      >
        <Box
          style={{
            backgroundColor: colorScheme === "dark" ? "#121212" : "#ffffff",
            height: 40,
          }}
        >
          <NavigationHeader showCartButton />
        </Box>
        <ScrollView>
          <Image
            alt={product?.title ?? ""}
            className="w-full h-[350px]"
            source={{ uri: product?.cover_url_large ?? "" }}
          />
          <Text
            style={{
              fontFamily: "Urbanist-Bold",
              fontSize: 24,
              lineHeight: 24,
              color: colorScheme === "dark" ? "#fff" : "#000",
            }}
            className="px-4 mt-6 mb-2"
          >
            {product?.title}
          </Text>
          <View className="px-4 mt-6 mb-2">
            {/* <Text
            style={{
              color: "#2563eb",
              textDecorationLine: "underline",
              fontWeight: "500",
              marginBottom: 8,
            }}
            onPress={() => {}}
          >
            Part of Amazing Spider-Man Series &gt;
          </Text> */}
            <View
              style={{
                alignItems: "center",
                marginBottom: 16,
                position: "relative",
              }}
            >
              <VStack className="absolute top-4 right-4" space="md">
                <Box className="mb-4">
                  <Pressable
                    onPress={() => {
                      // TODO: Implement zoom functionality
                    }}
                    accessibilityLabel="Zoom image"
                    hitSlop={8}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                      alignItems: "center",
                      justifyContent: "center",
                    })}
                  >
                    <ZoomIn size={24} color="#fff" />
                  </Pressable>
                </Box>
                <Box className="w-6">
                  <Pressable
                    onPress={() => {
                      // TODO: Implement download functionality
                    }}
                    accessibilityLabel="Download image"
                    hitSlop={8}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                      alignItems: "center",
                      justifyContent: "center",
                    })}
                  >
                    <Download size={24} color="#fff" />
                  </Pressable>
                </Box>
              </VStack>
            </View>
            <Text
              style={{
                fontFamily: "PublicSans-regular",
                fontSize: 16,
                color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
              }}
            >
              {product?.description ?? ""}
            </Text>
            <Text
              style={{
                fontFamily: "Urbanist-Bold",
                fontSize: 16,
                color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
              }}
            >
              Publisher
            </Text>
            <Text style={{ marginBottom: 8 }}>{product?.publisher}</Text>

            {product?.creators && (
              <>
                <Text
                  style={{
                    fontFamily: "Urbanist-Bold",
                    fontSize: 16,
                    color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
                  }}
                >
                  Creators
                </Text>
                <Text style={{ marginBottom: 8 }}>{product?.creators}</Text>
              </>
            )}
            <Text
              style={{
                fontFamily: "Urbanist-Bold",
                fontSize: 16,
                color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
              }}
            >
              ISBN/UPC
            </Text>
            <Text
              style={{
                fontFamily: "PublicSans-regular",
                fontSize: 16,
                marginBottom: 8,
                color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
              }}
            >
              {product?.isbn || product?.upc}
            </Text>
            <Text
              style={{
                fontFamily: "Urbanist-Bold",
                fontSize: 16,
                color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
              }}
            >
              Price
            </Text>
            <Text
              style={{
                fontFamily: "PublicSans-regular",
                fontSize: 16,
                marginBottom: 8,
                color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
              }}
            >
              {product?.formatted_price ??
                "PHP " + Number(product?.price).toFixed(2)}
            </Text>
            <Text
              style={{
                fontFamily: "Urbanist-Bold",
                fontSize: 16,
                color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
              }}
            >
              Available Quantity
            </Text>
            <Text
              style={{
                fontFamily: "PublicSans-regular",
                fontSize: 16,
                marginBottom: 8,
                color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
              }}
            >
              {product?.quantity ?? "Out of Stock"}
            </Text>
            {/* Collection Status */}
            <Text
              style={{
                fontFamily: "Urbanist-Bold",
                fontSize: 16,
                color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
              }}
            >
              Your Collection Status
            </Text>
            {/* Series Status (Collection Progress) */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              {seriesLoading ? (
                <Text
                  style={{
                    fontFamily: "PublicSans-regular",
                    fontSize: 16,
                    color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
                  }}
                >
                  Loading...
                </Text>
              ) : seriesStatus ? (
                <>
                  <Text
                    style={{
                      fontFamily: "PublicSans-regular",
                      fontSize: 16,
                      color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
                    }}
                  >
                    {seriesStatus?.related_series?.collected ?? 0} of{" "}
                    {seriesStatus?.related_series?.total === 0
                      ? 1
                      : seriesStatus?.related_series?.total}{" "}
                    Series Collected
                  </Text>
                  <Text
                    style={{
                      fontFamily: "PublicSans-regular",
                      fontSize: 16,
                      color: colorScheme === "dark" ? "#FFFFFF" : "#2563eb",
                    }}
                  >
                    {(() => {
                      const collected = Number(
                        seriesStatus?.related_series?.collected ?? 0
                      );
                      let total = Number(
                        seriesStatus?.related_series?.total ?? 1
                      );
                      if (!total) total = 1;
                      return ((collected / total) * 100).toFixed(0);
                    })()}
                    % Complete
                  </Text>
                </>
              ) : (
                <Text
                  style={{
                    fontFamily: "PublicSans-regular",
                    fontSize: 16,
                    color: colorScheme === "dark" ? "#FFFFFF" : "#374151",
                  }}
                >
                  No series data
                </Text>
              )}
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: "#e5e7eb",
                borderRadius: 4,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: seriesStatus
                    ? `${seriesStatus.completion_percent ?? 0}%`
                    : "0%",
                  height: 8,
                  backgroundColor: "#2563eb",
                  borderRadius: 4,
                }}
              />
            </View>
            <Text
              style={{
                fontFamily: "Urbanist-Bold",
                fontSize: 16,
                color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
                marginBottom: 16,
              }}
            >
              You may also like
            </Text>
            <FlatList
              data={recommendations?.recommendations || []}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, idx) => `${item.id}_${idx}`}
              renderItem={({ item }) => (
                <Box className="max-w-[180px]">
                  <ProductCard product={item} />
                </Box>
              )}
              ListEmptyComponent={() =>
                recsLoading ? (
                  <Text style={{ color: "#6b7280" }}>Loading...</Text>
                ) : (
                  <Text style={{ color: "#6b7280" }}>No recommendations</Text>
                )
              }
              style={{ marginBottom: 16 }}
            />
          </View>
          {/* Bottom Bar */}
          <View
            style={{
              flexDirection: "row",
              padding: 16,
              backgroundColor: colorScheme === "dark" ? "#121212" : "#fff",
              borderTopWidth: 1,
              borderColor: colorScheme === "dark" ? "#121212" : "#e5e7eb",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Want List Button */}
            <Pressable
              onPress={async () => {
                if (store.user !== null) {
                  try {
                    await addToWantList(product.id);
                    setIsWanted(true);
                    toast.show({
                      placement: "top",
                      render: ({ id }) => {
                        const toastId = "toast-" + id;
                        return (
                          <Toast nativeID={toastId} action="success">
                            <ToastTitle>Product added to want list!</ToastTitle>
                          </Toast>
                        );
                      },
                    });
                  } catch (err) {
                    toast.show({
                      placement: "top",
                      render: ({ id }) => {
                        const toastId = "toast-" + id;
                        return (
                          <Toast nativeID={toastId} action="error">
                            <ToastTitle>Failed to add to want list.</ToastTitle>
                          </Toast>
                        );
                      },
                    });
                  }
                }
              }}
              disabled={isWanted}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colorScheme === "dark" ? "#121212" : "#d1d5db",
                borderRadius: 14,
                backgroundColor: colorScheme === "dark" ? "#121212" : "#fff",
                paddingVertical: 14,
                marginRight: 6,
                opacity: isWanted ? 0.6 : 1,
              }}
            >
              {/* Heart icon from lucide-react-native */}
              <Heart
                fill={colorScheme === "dark" ? "#fff" : "#111"}
                color={colorScheme === "dark" ? "#fff" : "#111"}
                size={24}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontFamily: "Urbanist-Bold",
                  fontSize: 16,
                  color: colorScheme === "dark" ? "#fff" : "#111",
                }}
              >
                {isWanted ? "Already added to want list" : "Add to want list"}
              </Text>
            </Pressable>

            {/* Add to Cart Button */}
            <Button
              action="primary"
              className="rounded-full h-16 w-16"
              onPress={async () => handleAddToCart()}
              disabled={maxQuantity === 0 || !isQuantityValid}
            >
              <ShoppingCart color="#fff" size={24} />
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
