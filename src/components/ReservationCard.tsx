import { ProductT } from "@/src/utils/types/common"
import { FC, useState } from "react"
import { Box } from "./ui/box"
import { Image } from "./ui/image"
import { Text } from "./ui/text"
import { Dimensions, View } from "react-native"
import { useBoundStore } from "../store"
import { fonts } from "../theme"

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
              imgError ? "pl-4 h-60 p-8 w-[130px]" : "h-60 p-1 w-[130px] "
            }
            resizeMode={imgError ? "contain" : "cover"}
            onError={() => setImgError(true)}
          />
          {/* Show full screen icon if owned */}

          <View className='absolute top-1 left-1 right-1 bottom-1 bg-black/50 justify-center items-center'>
            <Text style={[fonts.caption, { color: theme.white }]}>
              {product.status === "for_approval"
                ? "Pending Approval"
                : product.status}
            </Text>
          </View>
        </View>
        <View className='mt-2'>
          <Text numberOfLines={1} style={[fonts.label, { color: theme.text }]}>
            {product.title}
          </Text>
          <Text
            numberOfLines={1}
            style={[fonts.caption, { color: theme.text }]}
          >
            {product.creators}
          </Text>
        </View>
      </View>
    </Box>
  )
}

export default ReservationCard
