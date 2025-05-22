import { ProductT } from "@/src/utils/types/common";
import { FC } from "react";
import { Box } from "../ui/box";
import { Image } from "../ui/image";
import { Text } from "../ui/text";
import { View } from "react-native";

interface ProductCardProps {
  product: ProductT;
  isInCart?: boolean;
}

const ProductCard: FC<ProductCardProps> = (data, isInCart = false) => {
  const { product } = data;

  return (
    <Box className="mb-2">
      <View style={{ padding: 4, margin: 4, marginBottom: 0 }}>
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
          {product.formatted_price && (
            <Text className="text-green-700 font-bold">
              {product.formatted_price}
            </Text>
          )}
          <Text numberOfLines={1} className="text-gray-600">
            {product.creators}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mt-1">
          <View style={{ alignItems: "flex-end" }}></View>
        </View>
      </View>
    </Box>
  );
};

export default ProductCard;
