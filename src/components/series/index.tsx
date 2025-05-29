import { FC, useState } from "react";
import { Box } from "../ui/box";
import { Image } from "../ui/image";
import { Text } from "../ui/text";
import { Pressable, useColorScheme, View } from "react-native";
import { addToWantList, addToCart } from "@/src/api/apiEndpoints";
import { useToast } from "@/src/components/ui/toast";
import { useBoundStore } from "@/src/store";
import { ShoppingCart, StarIcon } from "lucide-react-native";

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
    product_items_count?: number;
    in_want_list?: boolean;
  };
  grayed?: boolean;
}

const SeriesCard: FC<SeriesCardProps> = ({ data, grayed }) => {
  const colorScheme = useColorScheme();
  const toast = useToast();
  const store = useBoundStore();
  const [imgError, setImgError] = useState(false);

  const mainImage =
    data.last_product?.image_url || data.cover_url_large || undefined;

  const handleAddToWantList = async () => {
    try {
      await addToWantList(data.series.id);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Text className="text-green-600">Added to Want List!</Text>
        ),
      });
    } catch (error) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Text className="text-red-600">Failed to add to Want List.</Text>
        ),
      });
    }
  };

  const handleAddToCart = async () => {
    try {
      // You may need to adjust parameters based on your backend
      await addToCart(store.user.id, data.series.id, data.last_product.id);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Text className="text-green-600">Added to Cart!</Text>
        ),
      });
    } catch (error) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Text className="text-red-600">Failed to add to Cart.</Text>
        ),
      });
    }
  };

  return (
    <Box className="mb-2 w-[180px]">
      <View style={{ paddingHorizontal: 12, margin: 4, marginBottom: 0 }}>
        <View style={{ position: "relative" }}>
          <Image
            source={
              imgError || !mainImage
                ? require("@/src/assets/icon.png")
                : { uri: mainImage }
            }
            alt={"banner"}
            className={
              imgError
                ? "pl-4 h-56 p-2 w-full rounded-md bg-gray-200"
                : "h-56 p-2 w-full rounded-md "
            }
            resizeMode="contain"
            onError={() => setImgError(true)}
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
                style={{
                  color: "#FAFAFA",
                }}
              >
                Not Collected
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                <Pressable
                  className="p-3 rounded-full"
                  style={{
                    backgroundColor: "#77778a",
                    opacity: data.in_want_list ? 1 : 0.7,
                  }}
                  onPress={handleAddToWantList}
                  disabled={data.in_want_list}
                >
                  {data.in_want_list ? (
                    <StarIcon
                      fill="#ffd700"
                      color={data.in_want_list ? "#ffd700" : "#fff"}
                      size={24}
                    />
                  ) : (
                    <StarIcon color="#fff" size={24} />
                  )}
                </Pressable>
                <Pressable
                  className="p-3 rounded-full"
                  style={{
                    backgroundColor:
                      data.product_items_count !== 0 ? "#77778a" : "#d1d1d1",
                    opacity: data.product_items_count !== 0 ? 0.7 : 0.4,
                  }}
                  onPress={handleAddToCart}
                  disabled={data.product_items_count === 0}
                >
                  <ShoppingCart size={24} color="white" />
                </Pressable>
              </View>
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
