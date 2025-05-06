import { Box } from "@/src/components/ui/box";
import { Text } from "@/src/components/ui/text";
import { Image } from "@/src/components/ui/image";
import { useBoundStore } from "@/src/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View } from "react-native";
import { Button, ButtonText } from "@/src/components/ui/button";
import { useNavigation } from "@react-navigation/native";
import { ProductT } from "@/src/utils/types/common";
import { useToast, Toast, ToastTitle } from "@/src/components/ui/toast";
import NavigationHeader from "@/src/components/navigation-header";
import { addToWantList } from "@/src/api/apiEndpoints";

export default function Product(props: {
  route: { params: { product: ProductT } };
}) {
  const { route } = props;
  const { params } = route;
  const { product } = params;

  const store = useBoundStore();
  const navigation = useNavigation();
  const toast = useToast();

  const handleAddToCart = () => {
    if (product && (product.quantity ?? 0) > 0) {
      const currentCartItems = store.cartItems;
      const newCartItems = [...currentCartItems, product];
      store.setCartItems(newCartItems as []);
      console.log(`${product.title} added to cart.`);

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
              <Text className="font-bold 2xl mt-4 mb-2">Buy this product</Text>
              <Text>{product?.quantity ?? 0} copies remaining</Text>
            </Box>
          }
        />
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 12,
          }}
        >
          {(product?.quantity ?? 0) !== 0 ? (
            <Button
              onPress={handleAddToCart}
              disabled={(product?.quantity ?? 0) <= 0}
              style={[
                (product?.quantity ?? 0) <= 0
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
              onPress={() => {
                addToWantList(product.id)
                  .then((res) => {
                    console.log("success", res);
                  })
                  .catch((err) => {
                    console.log("error", err);
                  });
              }}
              style={[{ flex: 1 }]}
              size="xl"
            >
              <ButtonText>Add to want list instead</ButtonText>
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
