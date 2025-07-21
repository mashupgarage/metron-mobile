import { ProductT } from "@/src/utils/types/common"
import { FC, useState } from "react"
import { Box } from "./ui/box"
import { Image } from "./ui/image"
import { Text } from "./ui/text"
import { View, Dimensions } from "react-native"
import { useBoundStore } from "@/src/store"
import { fonts } from "@/src/theme"
import { HStack } from "./ui/hstack"

interface CompactProductCardProps {
  product: ProductT
  onPress?: () => void
  disabled?: boolean
  isReserved?: boolean
  right?: React.ReactNode
}

const CompactProductCard: FC<CompactProductCardProps> = ({ product, onPress, disabled, isReserved, right }) => {
  const [imgError, setImgError] = useState(false)
  const theme = useBoundStore((state) => state.theme)
  const width = Dimensions.get("window").width

  return (
    <Box className="mb-4">
      <HStack space='xs' style={{ flexDirection: "row", alignItems: "center", gap: 4, opacity: disabled ? 0.5 : 1 }}>
        <View className="w-1/4">
          <View style={{ position: "relative" }}>
            <Image
              source={imgError || !product.cover_url ? require("@/src/assets/icon.png") : { uri: product.cover_url }}
              alt={product.id.toString()}
              style={{ backgroundColor: theme.background2, marginRight: 16 }}
              resizeMode="cover"
              className='rounded-md h-[125px] w-[125px]'
              onError={() => setImgError(true)}
            />
            {isReserved && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "100%",
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 6,
                  zIndex: 1,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              />
            )}
          </View>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={2} style={[fonts.label, { color: theme.text, fontWeight: "bold" }]}
            ellipsizeMode="tail">
            {product.title}
          </Text>
          <Text numberOfLines={1} style={[fonts.caption, { color: theme.text }]} ellipsizeMode="tail">
            {product.creators}
          </Text>
          {product.publisher && (
            <Text numberOfLines={1} style={[fonts.caption, { color: theme.text, opacity: 0.7, marginTop: 8 }]}>
              {product.publisher}
            </Text>
          )}
        </View>
        {right ? <View style={{ marginLeft: 8 }}>{right}</View> : null}
      </HStack>
    </Box>
  )
}

export default CompactProductCard
