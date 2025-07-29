import { ProductT } from "@/src/utils/types/common"
import { FC, useState } from "react"
import { Box } from "../ui/box"
import { Image } from "../ui/image"
import { Text } from "../ui/text"
import { Dimensions, View, TouchableOpacity } from "react-native"
import { Check, Heart, HeartIcon } from "lucide-react-native"
import { useBoundStore } from "@/src/store"
import { fonts } from "@/src/theme"
import { HStack } from "../ui/hstack"

interface ProductCardProps {
  product: ProductT
  grid?: boolean
  isReserved?: boolean
  isSelected?: boolean
  isWanted?: boolean
  showWantListButton?: boolean
  onWantListPress?: () => void
  showAlreadyReservedText?: boolean
  reservedOverlayBottom?: number
  reservationStatus?: string
  children?: React.ReactNode
  isInCart?: boolean
  hasPreview?: boolean
}

const ProductCard: FC<ProductCardProps> = ({
  product,
  grid = false,
  children,
  isReserved,
  isSelected,
  isWanted,
  showWantListButton,
  onWantListPress,
  showAlreadyReservedText,
  reservedOverlayBottom = 0,
  reservationStatus,
  isInCart = false,
  hasPreview = false,
}) => {
  const [imgError, setImgError] = useState(false)
  const theme = useBoundStore((state) => state.theme)

  const mainImage = product.cover_url || undefined
  const highResImage = product.cover_url_large || undefined
  const thirdWidth = Dimensions.get("window").width / 3

  // Preview mode for collection screen
  if (hasPreview) {
    return (
      <Box className='mb-2' style={{ width: thirdWidth * 0.9 }}>
        <View style={{ marginBottom: 0 }}>
          <View style={{ position: "relative" }}>
            <Image
              source={
                imgError || !mainImage
                  ? require("@/src/assets/icon.png")
                  : { uri: mainImage }
              }
              alt={product.title}
              className={imgError ? 'pl-4 h-56 w-[160px] bg-gray-200' : 'h-56 w-[160px]'}
              resizeMode='contain'
              onError={() => setImgError(true)}
            />
            {children && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 10,
                }}
                pointerEvents='box-none'
              >
                {children}
              </View>
            )}
          </View>
          <View className='px-2'>
            <View style={{ minHeight: 48 }}>
              <Text
                numberOfLines={2}
                style={[fonts.label, { color: theme.text, fontWeight: "bold", lineHeight: 18 }]}
              >
                {product.title}
              </Text>
            </View>
            {typeof product.meta_attributes?.owned_products === "number" &&
            typeof product.meta_attributes?.unowned_products === "number" ? (
              <Text style={[fonts.caption, { color: theme.text }]}>
                {product.meta_attributes.owned_products.toString()} out of{" "}
                {(product.meta_attributes.owned_products + product.meta_attributes.unowned_products).toString()}
              </Text>
            ) : null}
          </View>
        </View>
      </Box>
    )
  }

  return grid ? (
    <Box className='mb-2' style={{ position: "relative" }}>
      {/* Reservation status overlay (grid) */}
      { (isReserved || reservationStatus) && (
        <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 3,
          borderRadius: 0,
        }}
        pointerEvents='none'
      >
          <Box className='absolute transform translate-y-4 translate-x-1 rounded-full mr-1 z-40 bg-black p-1 pl-4 pr-4 justify-center items-center'>
            <Text
              style={[
                theme.fonts.caption,
                { color: theme.white, fontWeight: "bold" },
              ]}
            >
               {reservationStatus === "for_approval" ? "Pending" : reservationStatus}
            </Text>
          </Box>
      </View>
      )}
      {/* Selection checkmark */}
      {isSelected && (
        <View
          style={{
            position: "absolute",
            backgroundColor: "rgba(0,0,0,1)",
            padding: 4,
            top: 12,
            right: 4,
            borderRadius: 24,
            zIndex: 6,
          }}
          pointerEvents='none'
        >
          <Check size={16} strokeWidth={3} color={theme.success} />
        </View>
      )}
      {/* Want-list button */}
      {showWantListButton && (
        <TouchableOpacity
          className={`px-2 py-4 absolute opacity-100`}
          style={{ zIndex: 5, right: 0, top: 0 }}
          disabled={isWanted}
          onPress={onWantListPress}
        >
          {isWanted ? (
            <Heart size={20} stroke={theme.error} fill={theme.error} />
          ) : (
            <HeartIcon size={20} color={theme.error} strokeWidth={3} />
          )}
        </TouchableOpacity>
      )}
      {/* Already Reserved text */}
      {isReserved && showAlreadyReservedText && (
        <View
          style={{
            alignItems: "flex-end",
            position: "absolute",
            top: 80,
            right: 0,
            zIndex: 6,
          }}
          pointerEvents='none'
        >
          <Text
            style={[fonts.caption, { color: theme.white }]}
            className='px-2'
          >
            Already Reserved
          </Text>
        </View>
      )}
      {/* Allow overlays to be injected as children (fallback for custom overlays) */}
      {children && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
          }}
          pointerEvents='box-none'
        >
          {children}
        </View>
      )}
      <View
        style={{
          marginBottom: 0,
          width: thirdWidth * 0.9,
        }}
        className='grid grid-cols-3'
      >
        <Image
          source={
            imgError || !mainImage
              ? require("@/src/assets/icon.png")
              : { uri: highResImage }
          }
          alt={product.id.toString()}
          className={
            imgError ? "pl-4 h-56 w-[160px] bg-gray-200" : "h-56 w-[160px]"
          }
          resizeMode='contain'
          onError={() => setImgError(true)}
        />
        <View>
          <Text
            style={[fonts.body, { color: theme.text, fontWeight: "bold", lineHeight: 18 }]}
            numberOfLines={2}
            ellipsizeMode='tail'
            className='text-lg'
          >
            {product.title}
          </Text>
          {product.formatted_price && (
            <Text
              style={[fonts.body, { color: theme.text, fontWeight: "bold" }]}
              className='text-green-700 font-bold'
            >
              {product.formatted_price}
            </Text>
          )}
        </View>
        <View className='flex-row justify-between items-center mt-1'></View>
      </View>
    </Box>
  ) : (
    <HStack space='xs' className='mb-3'>
      {/* Selection checkmark */}
      {isSelected && (
        <View
          style={{
            position: "absolute",
            backgroundColor: "rgba(0,0,0,1)",
            padding: 4,
            top: 0,
            right: 4,
            borderRadius: 24,
            zIndex: 6,
          }}
          pointerEvents='none'
        >
          <Check size={16} strokeWidth={3} color={theme.success} />
        </View>
      )}
      <>
        <Image
          className='aspect-[3/4] w-1/4'
          resizeMode='contain'
          source={{ uri: product.cover_url }}
          alt={product.title}
        />
      </>
      <Box
        style={{ maxWidth: Dimensions.get("window").width - thirdWidth - 20 }}
      >
        <Text
          style={{
            fontWeight: "bold",
            fontFamily: "Inter",
            color: theme.text,
            maxWidth: Dimensions.get("window").width - thirdWidth,
          }}
          numberOfLines={2}
          ellipsizeMode='tail'
          className='text-lg'
        >
          {product.title}
        </Text>
        <Text
          style={{
            color: theme.text,
            maxWidth: Dimensions.get("window").width - thirdWidth,
            }}
            numberOfLines={2}
            ellipsizeMode='tail'
          className='text-sm'
        >
          {product.creators}
          </Text>
               {/* Reservation status badge (list) */}
        {reservationStatus && (
          <Text
            style={[
              fonts.caption,
              {
                color: theme.white,
                backgroundColor: theme.gray[800],
                borderRadius: 8,
                marginTop: theme.spacing.xs,
                paddingVertical: 2,
                alignSelf: "flex-start",
                paddingHorizontal: 8,
              },
            ]}
          >
            {reservationStatus === "for_approval" ? "Pending Approval" : reservationStatus}
          </Text>
          )}
        <Text
          style={{ color: theme.text, marginTop: 2 }}
          className='text-sm'
        >
          {product.publisher}
          </Text>
          {isInCart && (
            <Text
            style={{ color: theme.text, ...theme.fonts.label }}
          >
            {product.formatted_price}
          </Text>
          )}
          {/* Reserved badge (list) */}
       {isReserved && (
          <Text
            style={[
              fonts.caption,
              {
                color: theme.white,
                marginTop: theme.spacing.xs,
                backgroundColor: theme.gray[800],
                borderRadius: 8,
                paddingVertical: 2,
                alignSelf: "flex-start",
                paddingHorizontal: 8,
              },
            ]}
          >
            Already Reserved
          </Text>
          )}
      
        </Box>
      <Box style={{ position: "absolute", right: 5, top: 2 }}>
        {showWantListButton && (
          <TouchableOpacity disabled={isWanted} onPress={onWantListPress}>
            {isWanted ? (
              <Heart size={20} stroke={theme.error} fill={theme.error} />
            ) : (
              <HeartIcon size={20} color={theme.error} strokeWidth={3} />
            )}
          </TouchableOpacity>
        )}
      </Box>
    </HStack>
  )
}

export default ProductCard
