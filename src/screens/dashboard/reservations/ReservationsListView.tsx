import React from "react"
import { FlatList, Pressable, View } from "react-native"
import CompactProductCard from "@/src/components/CompactProductCard"
import { ProductT } from "@/src/utils/types/common"
import { Box } from "@/src/components/ui/box"

interface ReservationsListViewProps {
  products: ProductT[]
  onPressProduct: (product: ProductT) => void
  keyExtractor: (item: ProductT, index: number) => string
}

interface ReservationsListViewProps {
  products: ProductT[]
  onPressProduct: (product: ProductT) => void
  keyExtractor: (item: ProductT, index: number) => string
  loadMoreProducts: () => void
}

const ReservationsListView: React.FC<ReservationsListViewProps> = ({ products, onPressProduct, keyExtractor, loadMoreProducts }) => {
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <Pressable onPress={() => onPressProduct(item)}>
          <CompactProductCard product={item} />
        </Pressable>
      )}
      keyExtractor={keyExtractor}
      contentContainerStyle={{ padding: 12 }}
      onEndReached={loadMoreProducts}
      ListFooterComponent={<Box className="h-56" />}
      onEndReachedThreshold={0.5}
    />
  )
}

export default ReservationsListView
