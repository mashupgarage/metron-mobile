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
    <Box className="mb-2">
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
                ? "pl-4 h-60 p-8 w-[180px] rounded-md"
                : "h-60 p-2 w-[180px] rounded-md "
            }
            resizeMode="contain"
            onError={() => setImgError(true)}
          />
          {/* Show full screen icon if owned */}

          <View className="absolute top-2 left-2 right-2 bottom-2 h-56 bg-black/50 justify-center items-center">
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
