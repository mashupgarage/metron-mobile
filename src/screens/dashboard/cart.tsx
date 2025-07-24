import { Button, ButtonText } from "@/src/components/ui/button"
import { useBoundStore } from "@/src/store"
import { StatusBar } from "expo-status-bar"
import { Text, View, FlatList } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { CartItemT } from "@/src/utils/types/common"
import { Box } from "@/src/components/ui/box"
import { Image } from "@/src/components/ui/image"
import { Trash2 } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { Checkbox } from "@/src/components/ui/checkbox"
import { fetchCartItems, removeFromCart } from "@/src/api/apiEndpoints"
import { DashboardStackParams } from "@/src/utils/types/navigation"
import { NavigationProp } from "@react-navigation/native"
import { fonts } from "@/src/theme"
import ProductCard from "@/src/components/rework/product-card"

export default function Cart() {
  const store = useBoundStore()
  const isDark = useBoundStore((state) => state.isDark)
  const theme = useBoundStore((state) => state.theme)
  const navigation = useNavigation<NavigationProp<DashboardStackParams>>()
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (store.user !== null) {
      fetchCartItems(store.user.id)
        .then((res) => {
          store.setCartItems(res.data)
        })
        .catch((err) => {
          console.log("cart items error", err)
        })
    }
  }, [])

  // Each cart item from the backend is already unique, so just add cartQuantity = 1 for each
  const groupedCartItems = (store.cartItems as CartItemT[]).map((item) => ({
    ...item,
    cartQuantity: 1,
  }))

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prevSelectedItems) => {
      const newSelectedItems = new Set(prevSelectedItems)
      if (newSelectedItems.has(itemId)) {
        newSelectedItems.delete(itemId)
      } else {
        newSelectedItems.add(itemId)
      }
      return newSelectedItems
    })
  }

  const handleRemoveCompletely = async (cartItemId: number) => {
    if (!store.user || !store.user.id) {
      alert("You must be logged in to remove items from the cart.")
      navigation.navigate("Auth" as never)
      return
    }
    try {
      await removeFromCart(store.user.id, cartItemId)
      const res = await fetchCartItems(store.user.id)
      if (res?.data) {
        store.setCartItems(res.data)
      }
      setSelectedItems((prevSelectedItems) => {
        const newSelectedItems = new Set(prevSelectedItems)
        newSelectedItems.delete(cartItemId)
        return newSelectedItems
      })
    } catch (error) {
      console.error("Error removing from cart:", error)
      alert("Failed to remove item from cart. Please try again.")
    }
  }

  const handleCheckout = () => {
    if (store.user) {
      navigation.navigate("CheckoutScreen", {
        itemsToCheckout: store.cartItems,
      })
    } else {
      navigation.navigate("Auth" as never)
    }
  }

  const renderItem = ({
    item,
  }: {
    item: CartItemT & { cartQuantity: number }
  }) => (
    <Box
      className={`flex-row items-center p-2`}
    >
      <Checkbox
        aria-label={`Select item ${item.product.title}`}
        value={item.id.toString()}
        style={{
          borderColor: theme.border,
          backgroundColor: theme.background,
        }}
        isChecked={selectedItems.has(item.id)}
        onChange={() => toggleItemSelection(item.id)}
        className='mr-2 p-2'
      >
        <ProductCard isInCart product={item.product} />
       
      </Checkbox>
      <Button
          size='xs'
          variant='link'
          className='p-2 ml-auto mr-2 top-3 absolute right-0'
          onPress={() => handleRemoveCompletely(item.id)}
        >
          <Trash2 size={18} color={theme.error} />
        </Button>
    </Box>
  )

  return (
    <SafeAreaView className={`flex-1 bg-[${theme.background}]`}>
      <StatusBar style={isDark === true ? "light" : "dark"} />
      <Text
        style={[fonts.title, { color: theme.text, padding: theme.spacing.md }]}
      >
        Your Cart{" "}
      </Text>
      <View className='flex-1'>
        {groupedCartItems.length === 0 ? (
          <Text
            style={[fonts.body, { color: theme.text }]}
            className='mt-12 text-center'
          >
            Your cart is empty.
          </Text>
        ) : (
          <FlatList
            data={groupedCartItems}
            renderItem={({ item }) => renderItem({ item })}
            keyExtractor={(item) => item.id.toString()}
            className='flex-1 w-full'
            contentContainerStyle={{ paddingBottom: 96 }}
          />
        )}
      </View>
      {groupedCartItems.length > 0 && (
        <View
          style={{ backgroundColor: theme.background }}
          className={`absolute left-0 right-0 bottom-0 pb-4 pt-2 items-center`}
        >
          <View className='flex-row mx-1 mb-8'>
            <Button
              size='xl'
              onPress={handleCheckout}
              style={{ backgroundColor: theme.primary[500] }}
              className='flex-1'
            >
              <ButtonText style={[fonts.body, { color: theme.white }]}>
                Checkout
              </ButtonText>
            </Button>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}
