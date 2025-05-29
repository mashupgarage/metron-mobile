import { FC } from "react";
import { Box } from "../ui/box";
import { Image } from "../ui/image";
import { Text } from "../ui/text";
import { useColorScheme, View } from "react-native";

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
    cover_url_large?: string;
  };
  grayed?: boolean;
}

const SeriesCard: FC<SeriesCardProps> = ({ data, grayed }) => {
  const colorScheme = useColorScheme();
  return (
    <Box className="mb-2 w-[180px]">
      <View style={{ paddingHorizontal: 12, margin: 4, marginBottom: 0 }}>
        <View style={{ position: "relative" }}>
          <Image
            source={{
              uri: data.last_product?.image_url || data.cover_url_large,
            }}
            alt={"banner"}
            className="h-52 w-full rounded-md"
            resizeMode="cover"
            style={{ opacity: grayed ? 0.7 : 1 }}
          />
          {grayed && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(200,200,200,0.8)",
                borderRadius: 4, // match your image's border radius
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                className="font-bold"
                style={{ color: colorScheme === "dark" ? "white" : "black" }}
              >
                Not Owned
              </Text>
            </View>
          )}
        </View>
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
