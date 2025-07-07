/**
 * Represents the global state slice.
 */
import { ProductT, CartItemT } from "@/src/utils/types/common"
import { StateCreator } from "zustand"

/**
 * this will handle global state changes for the app
 * such as loading and toggling between dark and light mode.
 */
export type GlobalSlice = {
  isLoading: boolean
  cartCount: number
  cartItems: CartItemT[]
  hasSeenCollectionSummary: boolean
  setHasSeenCollectionSummary: (val: boolean) => void
  setLoading: (value: boolean) => void
  setCartCount: (value: number) => void
  setCartItems: (value: CartItemT[]) => void
  decreaseItemQuantity: (productId: number) => void
  increaseItemQuantity: (productId: number) => void
  removeAllOfItemFromCart: (productId: number) => void
}

export const createGlobalSlice: StateCreator<GlobalSlice> = (set, get) => ({
  isLoading: false,
  cartCount: 0,
  cartItems: [],
  hasSeenCollectionSummary: false,
  setHasSeenCollectionSummary: (val: boolean) =>
    set(() => ({ hasSeenCollectionSummary: val })),

  setLoading: (value: boolean) => set(() => ({ isLoading: value })),
  setCartCount: (value: number) => set(() => ({ cartCount: value })),
  setCartItems: (value: CartItemT[]) =>
    set(() => ({
      cartItems: value,
      cartCount: value.length,
    })),
  decreaseItemQuantity: (productId: number) => {
    const currentItems = get().cartItems
    const itemIndex = currentItems.findIndex((item) => item.id === productId)

    if (itemIndex > -1) {
      const newItems = [
        ...currentItems.slice(0, itemIndex),
        ...currentItems.slice(itemIndex + 1),
      ]
      set({ cartItems: newItems, cartCount: newItems.length })
    } else {
      console.warn(
        `Product with ID ${productId} not found in cart for removal.`
      )
    }
  },
  increaseItemQuantity: (productId: number) => {
    const currentItems = get().cartItems
    const productToAdd = currentItems.find((item) => item.id === productId)

    if (!productToAdd) {
      console.warn(
        `Product with ID ${productId} not found in cart for increasing quantity.`
      )
      return
    }

    const currentQuantityInCart = currentItems.filter(
      (item) => item.id === productId
    ).length

    if ((productToAdd.product?.quantity ?? 0) > currentQuantityInCart) {
      const newItems = [...currentItems, productToAdd]
      set({ cartItems: newItems, cartCount: newItems.length })
    } else {
      console.warn(
        `Cannot add more of Product ID ${productId}. Max quantity reached.`
      )
    }
  },
  removeAllOfItemFromCart: (productId: number) => {
    const currentItems = get().cartItems
    const newItems = currentItems.filter((item) => item.id !== productId)
    set({
      cartItems: newItems,
      cartCount: newItems.length,
    })
  },
})
