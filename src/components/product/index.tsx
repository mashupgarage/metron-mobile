import { ProductT } from "@/src/utils/types/common";
import { FC, useState } from "react";
import { Box } from "../ui/box";
import { Image } from "../ui/image";
import { Text } from "../ui/text";
import { useColorScheme, View } from "react-native";

interface ProductCardProps {
  product: ProductT;
  isInCart?: boolean;
}

const ProductCard: FC<ProductCardProps> = (data, isInCart = false) => {
  const { product } = data;
  const [imgError, setImgError] = useState(false);

  const colorScheme = useColorScheme();

  const mainImage = product.cover_url || undefined;

  return (
    <Box className="mb-2">
      <View style={{ marginBottom: 0, gap: 8, maxWidth: 160 }}>
        <Image
          source={
            imgError || !mainImage
              ? require("@/src/assets/icon.png")
              : { uri: mainImage }
          }
          alt={product.id.toString()}
          className={
            imgError ? "pl-4 h-56 w-[160px] bg-gray-200" : "h-56 w-[160px] "
          }
          resizeMode="contain"
          onError={() => setImgError(true)}
        />
        <View className="mt-2">
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "Urbanist-Bold",
              color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
            }}
          >
            {product.title}
          </Text>
          {product.formatted_price && (
            <Text className="text-green-700 font-bold">
              {product.formatted_price}
            </Text>
          )}
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "PublicSans-regular",
              color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
            }}
            className="text-gray-600"
          >
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
