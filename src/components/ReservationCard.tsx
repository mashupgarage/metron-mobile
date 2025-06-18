import { ProductT } from "@/src/utils/types/common"
import { FC, useState } from "react"
import { Box } from "./ui/box"
import { Image } from "./ui/image"
import { Text } from "./ui/text"
import { Dimensions, View } from "react-native"
import { useBoundStore } from "../store"

interface ReservationCardProps {
  product: ProductT
}

const ReservationCard: FC<ReservationCardProps> = ({ product }) => {
  const [imgError, setImgError] = useState(false)
  const theme = useBoundStore((state) => state.theme)
  const deviceWidth = Dimensions.get("window").width

  const mainImage = product.cover_url || undefined

  return (
    <Box className={`mb-2 w-[${(deviceWidth / 3) * 0.9}px]`}>
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
                ? `h-60 p-2 w-[${(deviceWidth / 3) * 0.9}px] rounded-md`
                : `h-60 p-2 w-[${(deviceWidth / 3) * 0.9}px] rounded-md`
            }
            resizeMode='contain'
            onError={() => setImgError(true)}
          />
          {/* Show full screen icon if owned */}

          <View className='absolute top-0 left-0 right-0 bottom-0 h-full bg-black/50 justify-center items-center'>
            <Text
              className='font-bold mt-8'
              style={{ color: theme.white, fontSize: 12 }}
            >
              {product.status === "for_approval"
                ? "Pending Approval"
                : product.status}
            </Text>
          </View>
        </View>
        <View className='mt-2'>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "Inter",
              color: theme.text,
            }}
          >
            {product.title}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "Inter",
              color: theme.text,
            }}
            className='text-gray-600'
          >
            {product.creators}
          </Text>
        </View>
      </View>
    </Box>
  )
}

export default ReservationCard
