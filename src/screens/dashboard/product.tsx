import { Box } from "@/src/components/ui/box";
import { Text } from "@/src/components/ui/text";
import { Image } from "@/src/components/ui/image";
import { useBoundStore } from "@/src/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import { Button, ButtonText } from "@/src/components/ui/button";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { ProductT } from "@/src/utils/types/common";

export default function Product(props: {
  route: { params: { product: ProductT } };
}) {
  const { route } = props;
  const { params } = route;
  const { product } = params;

  const store = useBoundStore();
  const navigation = useNavigation();

  const handleAddToCart = () => {
    if (product && (product.quantity ?? 0) > 0) {
      const currentCartItems = store.cartItems;
      const newCartItems = [...currentCartItems, product];
      store.setCartItems(newCartItems as []);
      console.log(`${product.title} added to cart.`);
    } else {
      console.log("Product out of stock or invalid.");
    }
  };

  return (
    <SafeAreaView>
      <Button
        onPress={() => {
          navigation.goBack();
        }}
        className="absolute ml-4 top-16 p-0"
        variant="link"
      >
        <ArrowLeft />
        <ButtonText>Back</ButtonText>
      </Button>
      <ScrollView style={{ marginTop: 32, height: "100%" }}>
        <Box className="ml-4 pb-24 mr-4">
          <Text size="3xl" bold>
            {product?.title ?? ""}
          </Text>
          <Box className="h-72 mt-4 mb-4">
            <Image
              className="h-full w-full rounded-sm mt-4"
              source={{ uri: product?.cover_url ?? "" }}
            />
          </Box>
          <Text className="mt-4 mb-4">{product?.description ?? ""}</Text>
          <Text className="font-bold 2xl mb-2">Creators</Text>
          <Text>{product?.creators}</Text>
          <Text className="font-bold 2xl mt-4 mb-2">ISBN/UPC</Text>
          <Text>{product?.isbn ?? "not available"}</Text>
          <Text className="font-bold 2xl mt-4 mb-2">Buy this product</Text>
          <Text>{product?.quantity ?? 0} copies remaining</Text>
          <Button
            className="mt-4"
            onPress={handleAddToCart}
            disabled={(product?.quantity ?? 0) <= 0}
          >
            <ButtonText>Add to Cart ({product?.formatted_price ?? ''})</ButtonText>
          </Button>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
