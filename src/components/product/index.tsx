import { ProductT } from "@/src/utils/types/common";
import { FC } from "react";
import { Box } from "../ui/box";
import { Image } from "../ui/image";
import { Text } from "../ui/text";

interface ProductCardProps {
  product: ProductT;
  isInCart?: boolean;
}

const ProductCard: FC<ProductCardProps> = (data, isInCart = false) => {
  return (
    <Box className="">
      <Image
        source={{ uri: data.product.cover_url }}
        alt={data.product.id.toString()}
        className="h-72 w-80 rounded-md"
      />
      <Box className="mt-2 ml-2 mr-2">
        <Box>
          <Text isTruncated className="font-bold line-clamp-1">
            {data.product.title}
          </Text>
        </Box>
        <Box className="text-sm font-bold">
          <Text>{data.product.formatted_price}</Text>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductCard;
