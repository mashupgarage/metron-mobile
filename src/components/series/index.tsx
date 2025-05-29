import { FC, useState } from "react";
import { Box } from "../ui/box";
import { Image } from "../ui/image";
import { Text } from "../ui/text";
import { Pressable, useColorScheme, View } from "react-native";
import { addToWantList, addToCart } from "@/src/api/apiEndpoints";
import { useToast } from "@/src/components/ui/toast";
import { useBoundStore } from "@/src/store";
import { ShoppingCart, StarIcon, ZoomIn, Download } from "lucide-react-native";
import ImageViewing from "react-native-image-viewing";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";
import { HStack } from "../ui/hstack";

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
  detailedDisplay?: boolean;
  grayed?: boolean;
}

const SeriesCard: FC<SeriesCardProps> = ({ data, detailedDisplay, grayed }) => {
  const colorScheme = useColorScheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const toast = useToast();
  const [imgError, setImgError] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

  const handleAddToCart = async (item: any) => {
    try {
      navigation.navigate("Product", {
        product: item,
        fromCollection: true,
      });
    } catch (error) {
      console.log(error);
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
                ? "pl-4 h-60 p-8 w-full rounded-md"
                : "h-60 p-2 w-full rounded-md "
            }
            resizeMode="contain"
            onError={() => setImgError(true)}
            style={{ opacity: grayed ? 0.7 : 1 }}
          />
          {/* Show full screen icon if owned */}
          {!grayed && detailedDisplay && !imgError && mainImage && (
            <Pressable
              onPress={() => setIsImageViewerVisible(true)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "rgba(0,0,0,0.6)",
                borderRadius: 16,
                padding: 6,
                zIndex: 10,
              }}
              accessibilityLabel="View cover full screen"
              hitSlop={8}
            >
              <ZoomIn size={22} color="#fff" />
            </Pressable>
          )}
          <ImageViewing
            images={[{ uri: mainImage }]}
            imageIndex={0}
            visible={isImageViewerVisible}
            onRequestClose={() => setIsImageViewerVisible(false)}
            FooterComponent={({ imageIndex }) => (
              <View
                style={{
                  width: "100%",
                  alignItems: "flex-end",
                  padding: 24,
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                }}
              >
                <Pressable
                  onPress={async () => {
                    if (!mainImage) return;
                    setDownloading(true);
                    try {
                      const { status } =
                        await MediaLibrary.requestPermissionsAsync();
                      if (status !== "granted") {
                        toast.show({
                          placement: "top",
                          render: ({ id }) => (
                            <Text style={{ color: "red" }}>
                              Permission denied: Cannot save image.
                            </Text>
                          ),
                        });
                        setDownloading(false);
                        return;
                      }
                      const fileUri =
                        FileSystem.cacheDirectory +
                        "cover_" +
                        Date.now() +
                        ".jpg";
                      const downloadRes = await FileSystem.downloadAsync(
                        mainImage,
                        fileUri
                      );
                      const asset = await MediaLibrary.createAssetAsync(
                        downloadRes.uri
                      );
                      await MediaLibrary.createAlbumAsync(
                        "Download",
                        asset,
                        false
                      );
                      toast.show({
                        placement: "top",
                        render: ({ id }) => (
                          <Text style={{ color: "green" }}>
                            Image saved to gallery.
                          </Text>
                        ),
                      });
                    } catch (err) {
                      toast.show({
                        placement: "top",
                        render: ({ id }) => (
                          <Text style={{ color: "red" }}>
                            Failed to save image.
                          </Text>
                        ),
                      });
                    } finally {
                      setDownloading(false);
                    }
                  }}
                  style={{
                    backgroundColor: "rgba(0,0,0,0.7)",
                    borderRadius: 16,
                    padding: 10,
                    marginBottom: 10,
                    marginRight: 10,
                  }}
                  accessibilityLabel="Download image"
                  hitSlop={8}
                  disabled={downloading}
                >
                  <HStack className="flex-row items-center" space="md">
                    <Download
                      size={28}
                      color={colorScheme === "dark" ? "#FFFFFF" : "#DADADA"}
                    />
                    <Text
                      style={{
                        color: colorScheme === "dark" ? "#FFFFFF" : "#DADADA",
                      }}
                    >
                      Download
                    </Text>
                  </HStack>
                </Pressable>
              </View>
            )}
          />
          {grayed && (
            <View
              style={{
                position: "absolute",
                top: 6,
                left: 9,
                right: 9,
                bottom: 6,
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
                  onPress={() => handleAddToCart(data)}
                  disabled={data.product_items_count === 0}
                >
                  <ShoppingCart size={24} color="white" />
                </Pressable>
              </View>
            </View>
          )}
        </View>
        <View className="mt-2 px-2">
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
