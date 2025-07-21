import { ProductT } from "@/src/utils/types/common"
import { FC, useState } from "react"
import { Box } from "./ui/box"
import { Image } from "./ui/image"
import { Text } from "./ui/text"
import { View, Dimensions } from "react-native"
import { useBoundStore } from "@/src/store"
import { fonts } from "@/src/theme"

interface CompactProductCardProps {
  product: ProductT
  onPress?: () => void
  disabled?: boolean
  right?: React.ReactNode
}

const CompactProductCard: FC<CompactProductCardProps> = ({ product, onPress, disabled, right }) => {
  const [imgError, setImgError] = useState(false)
  const theme = useBoundStore((state) => state.theme)
  const width = Dimensions.get("window").width

  return (
    <Box className="mb-4">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, opacity: disabled ? 0.5 : 1 }}>
        <Image
          source={imgError || !product.cover_url ? require("@/src/assets/icon.png") : { uri: product.cover_url }}
          alt={product.id.toString()}
          style={{ borderRadius: 6, backgroundColor: theme.background2, marginRight: 16 }}
          resizeMode="cover"
          className="w-24 h-24"
          onError={() => setImgError(true)}
        />
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
      </View>
    </Box>
  )
}

export default CompactProductCard
