import { ProductT } from '@/src/utils/types/common'
import { FC, useState } from 'react'
import { Box } from '../ui/box'
import { Image } from '../ui/image'
import { Text } from '../ui/text'
import { View } from 'react-native'
import { useBoundStore } from '@/src/store'

interface ProductCardProps {
  product: ProductT
  isInCart?: boolean
}

const ProductCard: FC<ProductCardProps> = (data, isInCart = false) => {
  const { product } = data
  const [imgError, setImgError] = useState(false)
  const theme = useBoundStore((state) => state.theme)

  const mainImage = product.cover_url || undefined

  return (
    <Box className="mb-2">
      <View
        style={{ marginBottom: 0, gap: 8, maxWidth: 160 }}
        className="grid grid-cols-3"
      >
        <Image
          source={
            imgError || !mainImage
              ? require('@/src/assets/icon.png')
              : { uri: mainImage }
          }
          alt={product.id.toString()}
          className={
            imgError ? 'pl-4 h-56 w-[160px] bg-gray-200' : 'h-56 w-[160px]'
          }
          resizeMode="contain"
          onError={() => setImgError(true)}
        />
        <View>
          <Text
            style={{
              fontWeight: 'bold',
              fontFamily: 'Inter',
              maxWidth: 240,
              color: theme.text,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
            className="text-lg"
          >
            {product.title}
          </Text>
          {product.formatted_price && (
            <Text style={{ color: theme.text }} className="text-green-700 font-bold">
              {product.formatted_price}
            </Text>
          )}
          <Text numberOfLines={1} style={{ color: theme.text }} className="text-gray-600 text-sm">
            {product.creators}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mt-1">
          <View style={{ alignItems: 'flex-end' }}></View>
        </View>
      </View>
    </Box>
  )
}

export default ProductCard
