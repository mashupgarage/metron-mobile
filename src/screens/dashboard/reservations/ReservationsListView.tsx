import React from "react"
import { FlatList, Pressable, View, TouchableOpacity } from "react-native"
import { Check, Heart, HeartOff } from "lucide-react-native"
import ProductCard from "@/src/components/rework/product-card"
import { ProductT } from "@/src/utils/types/common"
import { Box } from "@/src/components/ui/box"
import { Text } from "@/src/components/ui/text"
import { useBoundStore } from "@/src/store"

interface ReservationsListViewProps {
  products: ProductT[]
  onPressProduct: (product: ProductT) => void
  keyExtractor: (item: ProductT, index: number) => string
  loadMoreProducts: () => void
  isMultiSelectMode: boolean
  selectedProducts: number[]
  reservedProductIds: number[]
  wantedProductIds: number[]
  toggleProductSelection: (productId: number) => void
  addToWantListHandler: (productId: number) => void
}

const ReservationsListView: React.FC<ReservationsListViewProps> = ({
  products,
  onPressProduct,
  keyExtractor,
  loadMoreProducts,
  isMultiSelectMode,
  selectedProducts,
  reservedProductIds,
  wantedProductIds,
  toggleProductSelection,
  addToWantListHandler,
}) => {
  const store = useBoundStore()
  const { theme } = store
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => {
        const isSelected = selectedProducts.includes(item.id)
        const isReserved = reservedProductIds.includes(item.id)
        const isWanted = wantedProductIds.includes(item.id)
        return (
          <>
            <Pressable
              onPress={() => {
                if (isMultiSelectMode) {
                  toggleProductSelection(item.id)
                } else {
                  onPressProduct(item)
                }
              }}
              disabled={isMultiSelectMode && isReserved}
            >
              <ProductCard
                product={item}
                showWantListButton
                isWanted={isWanted}
                isReserved={isReserved}
                isSelected={isSelected}
                showAlreadyReservedText
                reservedOverlayBottom={16}
                onWantListPress={() => addToWantListHandler(item.id)}
              />
            </Pressable>
          </>
        )
      }}
      keyExtractor={keyExtractor}
      contentContainerStyle={{ padding: 12 }}
      onEndReached={loadMoreProducts}
      ListFooterComponent={<Box className='h-56' />}
      onEndReachedThreshold={0.5}
    />
  )
}

export default ReservationsListView
