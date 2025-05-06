import { ProductT } from "@/src/utils/types/common";
import { Pressable, View } from "react-native";
import { Box } from "@/src/components/ui/box";
import { Image } from "@/src/components/ui/image";
import { Text } from "@/src/components/ui/text";

interface ProductPreviewProps {
  product: ProductT;
  selectedProducts: number[];
  navigation: any;
  isProductReserved: (product: ProductT) => boolean;
  getQuantityLeft: (product: ProductT) => number;
}

export const ProductPreview = ({
  product,
  selectedProducts,
  isProductReserved,
  getQuantityLeft,
  navigation,
}: ProductPreviewProps) => {
  return (
    <Pressable
      onPress={() => {
        // @ts-ignore
        navigation.navigate("Product", {
          product: product as ProductT,
        });
      }}
      style={({ pressed }) => [
        { opacity: pressed ? 0.7 : 1 },
        selectedProducts.includes(product.id)
          ? {
              borderWidth: 2,
              borderColor: "rgb(43,100,207)",
              borderRadius: 8,
              padding: 4,
              margin: 8,
              marginBottom: 0,
            }
          : { padding: 4, margin: 8, marginBottom: 0 },
      ]}
    >
      <Box className="mb-2">
        <View>
          <Image
            source={{ uri: product.cover_url }}
            alt={product.id.toString()}
            className="h-48 w-full rounded-md"
            resizeMode="cover"
          />
          <View className="mt-2">
            <Text numberOfLines={1} className="font-bold">
              {product.title}
            </Text>
            <Text className="text-green-700 font-bold">
              {product.formatted_price}
            </Text>
            <Text numberOfLines={1} className="text-gray-600">
              {product.creators}
            </Text>

            <View className="flex-row justify-between items-center mt-1">
              {isProductReserved(product) ? (
                <View className="bg-green-200 px-3 py-1 rounded">
                  <Text className="text-green-800">Reserved</Text>
                </View>
              ) : null}
              <View style={{ alignItems: "flex-end" }}>
                <Text className="mr-4">
                  {getQuantityLeft(product) === 0
                    ? "Out of Stock"
                    : `${getQuantityLeft(product)} left`}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Box>
    </Pressable>
  );
};
