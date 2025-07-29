import { useBoundStore } from "@/src/store"
import { HStack } from "@/src/components/ui/hstack"
import { Text } from "@/src/components/ui/text"
import { LayoutGrid, LayoutList } from "lucide-react-native"
import { Box } from "@/src/components/ui/box"
import { ActivityIndicator, Pressable, View } from "react-native"
import { fonts } from "@/src/theme"
import { useState } from "react"
import MasonryList from "@react-native-seoul/masonry-list"
import ProductCard from "../rework/product-card"
import { useNavigation } from "@react-navigation/native"

interface ProductT {
  id: string | number
  title: string
  creators?: string
  publisher?: string
  cover_url?: string
  cover_url_large?: string
  formatted_price?: string
  is_reserverd?: boolean
}

interface ProductListingProps {
  title: string
  products: ProductT[]
  loading?: boolean
  showReservationStatus?: boolean
  showPadding?: boolean
  ListHeaderComponent?: React.ReactNode
}

export const ProductListing = ({
  title,
  products,
  loading = false,
  showReservationStatus = false,
  showPadding = false,
  ListHeaderComponent,
}: ProductListingProps) => {
  const [isGrid, setIsGrid] = useState(true)
  const navigation = useNavigation()
  const theme = useBoundStore((state) => state.theme)

  // Footer component for loading indicator
  const renderFooter = () => (
    <Box className='py-4 flex justify-center items-center'>
      {loading && (
        <>
          <ActivityIndicator size='small' color={theme.primary[500]} />
          <Text style={[fonts.body, { color: theme.text }]} className='mt-2'>
            Loading products...
          </Text>
        </>
      )}
    </Box>
  )

  return (
    <Box
      className='h-screen w-full pb-32'
      style={{ backgroundColor: theme.background }}
    >
      {ListHeaderComponent}
      <HStack className='justify-between mr-2 ml-2'>
        <Box className='p-2 mt-4'>
          <Text style={[fonts.title, { color: theme.text }]}>{title}</Text>
        </Box>
        <HStack space={"xl"} className='p-2 my-4 flex items-center'>
          <Pressable onPress={() => setIsGrid(!isGrid)}>
            {isGrid ? (
              <LayoutList size={24} color={theme.text} />
            ) : (
              <LayoutGrid size={24} color={theme.text} />
            )}
          </Pressable>
        </HStack>
      </HStack>
      <MasonryList
        data={products}
        scrollEnabled
        numColumns={!isGrid ? 3 : 1}
        style={{ columnGap: 12, marginHorizontal: theme.spacing.sm }}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        ListFooterComponent={renderFooter()}
        renderItem={({
          item,
        }: {
          item: ProductT & { reservationStatus: string }
          i: number
        }) => (
          <View key={item.id}>
            {!isGrid ? (
              <Pressable
                onPress={() =>
                  navigation.navigate("Product", { product: item })
                }
              >
                <ProductCard
                  grid
                  reservationStatus={item.reservationStatus}
                  reservedOverlayBottom={40}
                  product={item as any}
                />
              </Pressable>
            ) : (
              // list view
              <Pressable
                onPress={() =>
                  navigation.navigate("Product", { product: item })
                }
              >
                <ProductCard
                  reservationStatus={item.reservationStatus}
                  product={item as any}
                />
              </Pressable>
            )}
          </View>
        )}
      />
      {showPadding && (
        <View style={{ alignItems: "center", marginVertical: 56 }}></View>
      )}
    </Box>
  )
}
