import { FC } from "react";
import { Box } from "../ui/box";
import { Image } from "../ui/image";
import { Text } from "../ui/text";
import { View } from "react-native";

interface SeriesCardProps {
  data: {
    series_id: number;
    series: {
      id: number;
      title: string;
    };
    count: number;
    publisher: string;
    last_product: {
      id: number;
      title: string;
      image_url: string;
    };
    owned_products: number;
    unowned_products: number;
  };
}

const SeriesCard: FC<SeriesCardProps> = ({ data }) => {
  return (
    <Box className="mb-2 w-[180px]">
      <View style={{ paddingHorizontal: 12, margin: 4, marginBottom: 0 }}>
        <Image
          source={{ uri: data.last_product.image_url }}
          alt={data.series.id.toString()}
          className="h-52 w-full rounded-md"
          resizeMode="cover"
        />
        <View className="mt-2">
          <Text numberOfLines={1} className="font-bold">
            {data.series.title}
          </Text>
          {data.owned_products && (
            <Text className=" font-bold">
              {data.owned_products} out of{" "}
              {data.owned_products + data.unowned_products}
            </Text>
          )}
        </View>
        <View className="flex-row justify-between items-center mt-1">
          <View style={{ alignItems: "flex-end" }}></View>
        </View>
      </View>
    </Box>
  );
};

export default SeriesCard;
