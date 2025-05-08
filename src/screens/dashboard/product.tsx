import React from "react";
import { Box } from "@/src/components/ui/box";
import { Text } from "@/src/components/ui/text";
import { Image } from "@/src/components/ui/image";
import { useBoundStore } from "@/src/store";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button, ButtonText } from "@/src/components/ui/button";
import { useNavigation } from "@react-navigation/native";
import { ProductT } from "@/src/utils/types/common";
import { useToast, Toast, ToastTitle } from "@/src/components/ui/toast";
import NavigationHeader from "@/src/components/navigation-header";
import {
  addToReservation,
  addToWantList,
  getWantList,
  addToCart,
  fetchCartItems,
  fetchProductDetails,
} from "@/src/api/apiEndpoints";

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
  const { route } = props;
  const { params } = route;
  const { product, fromReservations, reservationId, reservationList } = params;

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

  // Count of reserved products
  const reservedCount = Array.isArray(localReservationList)
    ? localReservationList.length
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 32 : 0}
      >
        <NavigationHeader showCartButton />
        <View className="ml-4 mr-4 mt-8 mb-4">
          <Text size="3xl" bold>
            {product?.title ?? ""}
          </Text>
          {fromReservations && (
            <Text style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
              Reserved products in this list: {reservedCount}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <FlatList
            data={[]}
            style={{ flex: 1, width: "100%" }}
            renderItem={() => null}
            ListHeaderComponent={
              <Box className="ml-4 mr-4 mb-8">
                <Box className="h-72 mt-4 mb-4">
                  <Image
                    className="h-full w-full rounded-sm mt-4"
                    source={{ uri: product?.cover_url ?? "" }}
                  />
                </Box>
                <Text className="mt-4 mb-4">{product?.description ?? ""}</Text>
                <Text className="font-bold 2xl mb-2">Publisher</Text>
                <Text>{product?.publisher_name}</Text>
                <Text className="font-bold 2xl mt-4 mb-2">Creators</Text>
                <Text>{product?.creators}</Text>
                <Text className="font-bold 2xl mt-4 mb-2">ISBN/UPC</Text>
                <Text>
                  {product?.isbn === null ? product?.upc : "not available"}
                </Text>
                <Text className="font-bold 2xl mt-4 mb-2">
                  Buy this product
                </Text>
                <Text>{maxQuantity} copies remaining</Text>
              </Box>
            }
          />
          <View
            style={{
              flexDirection: "row",
              marginHorizontal: 12,
              alignItems: "center",
            }}
          >
            {maxQuantity > 1 && (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: quantityError ? "#e53935" : "#ccc",
                  borderRadius: 6,
                  paddingHorizontal: 12,
                  marginRight: 12,
                  width: 60,
                  height: 48,
                  fontSize: 18,
                  textAlign: "center",
                  color: quantityError ? "#e53935" : undefined,
                }}
                keyboardType="number-pad"
                value={String(quantity)}
                onChangeText={(text) => {
                  let val = Number(text.replace(/[^0-9]/g, ""));
                  if (isNaN(val)) val = 0;
                  setQuantity(val);
                  setQuantityError(val < 1 || val > maxQuantity);
                }}
                editable={maxQuantity > 1}
                maxLength={3}
                placeholder="Qty"
                underlineColorAndroid="transparent"
                selectionColor={quantityError ? "#e53935" : undefined}
              />
            )}
            {maxQuantity > 0 ? (
              <Button
                onPress={
                  fromReservations ? handleAddToReservation : handleAddToCart
                }
                disabled={
                  maxQuantity <= 0 ||
                  !isQuantityValid ||
                  (fromReservations && isAlreadyReserved)
                }
                style={[
                  maxQuantity <= 0 ||
                  quantityError ||
                  quantity < 1 ||
                  (fromReservations && isAlreadyReserved)
                    ? { backgroundColor: "#cccccc" }
                    : undefined,
                  { flex: 1 },
                ]}
                size="xl"
              >
                <ButtonText>
                  {fromReservations
                    ? isAlreadyReserved
                      ? "Already reserved"
                      : `Add to Reservation (${
                          product?.formatted_price ??
                          Number(product.price).toFixed(2)
                        })`
                    : `Add to Cart (${
                        product?.formatted_price ??
                        Number(product.price).toFixed(2)
                      })`}
                </ButtonText>
              </Button>
            ) : (
              <Button
                onPress={async () => {
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
                    console.log("error", err);
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
                }}
                disabled={isWanted}
                style={[
                  { flex: 1 },
                  isWanted ? { backgroundColor: "#cccccc" } : undefined,
                ]}
                size="xl"
              >
                <ButtonText>
                  {isWanted
                    ? "Already on want list"
                    : "Add to want list instead"}
                </ButtonText>
              </Button>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
