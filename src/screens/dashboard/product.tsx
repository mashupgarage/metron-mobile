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
import { addToWantList, getWantList } from "@/src/api/apiEndpoints";

export default function Product(props: {
  route: { params: { product: ProductT } };
}) {
  const { route } = props;
  const { params } = route;
  const { product } = params;

  const [quantity, setQuantity] = React.useState(1);
  const [quantityError, setQuantityError] = React.useState(false);

  // Helper to check if quantity is valid
  const isQuantityValid = quantity >= 1 && quantity <= product.quantity;


  const store = useBoundStore();
  const navigation = useNavigation();
  const toast = useToast();

  const [isWanted, setIsWanted] = React.useState(false);

  React.useEffect(() => {
    getWantList()
      .then((res) => {
        const ids = res.data.want_lists.map((item: any) => item.product_id);
        setIsWanted(ids.includes(product.id));
      })
      .catch(() => setIsWanted(false));
  }, [product.id]);

  const handleAddToCart = () => {
    if (product && (product.quantity ?? 0) > 0) {
      const currentCartItems = store.cartItems;
      // Add the selected quantity to cart
      let newCartItems = [...currentCartItems];
      for (let i = 0; i < quantity; i++) {
        newCartItems.push(product);
      }
      store.setCartItems(newCartItems as []);
      console.log(`${product.title} x${quantity} added to cart.`);

      // Show success toast
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
    } else {
      console.log("Product out of stock or invalid.");
    }
  };

  console.log(product);
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
                <Text>{product?.quantity ?? 0} copies remaining</Text>
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
            {(product?.quantity ?? 0) > 1 && (
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
                  setQuantityError(val < 1 || val > product.quantity);
                }}
                editable={(product?.quantity ?? 0) > 1}
                maxLength={3}
                placeholder="Qty"
                underlineColorAndroid="transparent"
                selectionColor={quantityError ? "#e53935" : undefined}
              />
            )}
            {(product?.quantity ?? 0) !== 0 ? (
              <Button
                onPress={handleAddToCart}
                disabled={
                  (product?.quantity ?? 0) <= 0 || !isQuantityValid
                }
                style={[
                  (product?.quantity ?? 0) <= 0 || quantityError || quantity < 1
                    ? { backgroundColor: "#cccccc" }
                    : undefined,
                  { flex: 1 },
                ]}
                size="xl"
              >
                <ButtonText>
                  Add to Cart ({product?.formatted_price ?? ""})
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
