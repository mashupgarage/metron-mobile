import { ProductT } from "@/src/utils/types/common";
import { FC, useState } from "react";
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
  const [imgError, setImgError] = useState(false);

  const mainImage = product.cover_url || undefined;

  return (
    <Box className="mb-2">
      <View style={{ paddingHorizontal: 12, margin: 4, marginBottom: 0 }}>
        <Image
          source={
            imgError || !mainImage
              ? require("@/src/assets/icon.png")
              : { uri: mainImage }
          }
          alt={product.id.toString()}
          className={imgError ? "pl-4 h-60 w-full bg-gray-200" : "h-60 w-full "}
          resizeMode="contain"
          onError={() => setImgError(true)}
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
