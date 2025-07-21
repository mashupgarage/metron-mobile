import React from "react"
import { FlatList, Pressable, View, TouchableOpacity } from "react-native"
import { Check, Heart, HeartOff } from "lucide-react-native"
import CompactProductCard from "@/src/components/CompactProductCard"
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
            {isSelected && isMultiSelectMode && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 2,
                  zIndex: 100,
                  backgroundColor: "rgba(0,0,0,0.8)",
                  borderRadius: 24,
                  padding: 4,
                }}
              >
                <Check size={16} strokeWidth={3} color={theme.success} />
              </View>
            )}
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
              <CompactProductCard
                product={item}
                isReserved={isReserved}
                isMultiSelectMode={isMultiSelectMode}
                disabled={isMultiSelectMode && isReserved}
                right={
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {!isMultiSelectMode ? (
                      <TouchableOpacity
                        onPress={() => addToWantListHandler(item.id)}
                        disabled={isReserved}
                        style={{ marginRight: 2, marginTop: 0 }}
                      >
                        {isWanted ? (
                          <Heart
                            fill={theme.error}
                            color={theme.error}
                            width={24}
                            height={24}
                          />
                        ) : (
                          <Heart color={theme.border} width={24} height={24} />
                        )}
                      </TouchableOpacity>
                    ) : null}
                  </View>
                }
              />
            </Pressable>
            {isReserved && (
              <Box className='absolute transform translate-y-16 translate-x-4 rounded-full p-1 mr-1'>
                <Text style={[theme.fonts.caption, { color: theme.white, fontWeight: "bold" }]}>
                  Reserved
                </Text>
              </Box>
            )}
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
