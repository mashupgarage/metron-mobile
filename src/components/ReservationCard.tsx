import { ProductT } from "@/src/utils/types/common";
import { FC, useState } from "react";
import { Box } from "./ui/box";
import { Image } from "./ui/image";
import { Text } from "./ui/text";
import { useColorScheme, View } from "react-native";

interface ReservationCardProps {
  product: ProductT;
}

const ReservationCard: FC<ReservationCardProps> = ({ product }) => {
  const [imgError, setImgError] = useState(false);

  const colorScheme = useColorScheme();

  const mainImage = product.cover_url || undefined;

  return (
    <Box className="mb-2 w-[160px]">
      <View style={{ marginBottom: 0 }}>
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
                ? "h-56 p-2 w-[160px] rounded-md"
                : "h-56 p-2 w-[160px] rounded-md "
            }
            resizeMode="contain"
            onError={() => setImgError(true)}
          />
          {/* Show full screen icon if owned */}

          <View className="absolute top-0 left-3 right-3 bottom-0 h-full bg-black/50 justify-center items-center">
            <Text className="font-bold mt-8 text-white">
              {product.status === "for_approval"
                ? "Pending Approval"
                : product.status}
            </Text>
          </View>
        </View>
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
      </View>
    </Box>
  );
};

export default ReservationCard;
