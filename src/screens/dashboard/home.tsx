import { Box } from "@/src/components/ui/box"
import { Image } from "@/src/components/ui/image"
import { Text } from "@/src/components/ui/text"
import { useBoundStore } from "@/src/store"
import { View, ActivityIndicator, ScrollView, Dimensions } from "react-native"
import MasonryList from "@react-native-seoul/masonry-list"

import ProductCard from "@/src/components/product"
import { ProductT } from "@/src/utils/types/common"
import { Pressable } from "react-native-gesture-handler"
import {
  NavigationProp,
  useNavigation,
  DrawerActions,
  useRoute,
  RouteProp,
  ParamListBase,
} from "@react-navigation/native"
import { HStack } from "@/src/components/ui/hstack"
import { Button } from "@/src/components/ui/button"
import { Menu } from "lucide-react-native"
import { mockedCarouselItems } from "@/src/utils/mock"
import { useCallback, useEffect, useState } from "react"
import {
  fetchCartItems,
  fetchProducts,
  fetchUserProfile,
} from "@/src/api/apiEndpoints"
import Constants from "expo-constants"

import { LayoutGrid, LayoutList } from "lucide-react-native"

const PAGE_SIZE = 10 // Define standard page size

export default function Home() {
  const store = useBoundStore()
  const theme = useBoundStore((state) => state.theme)
  const route = useRoute<RouteProp<ParamListBase, "Home">>()
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const [selectedPill, setSelectedPill] = useState<number | undefined>(
    undefined
  )
  const [carouselItems, setCarouselItems] =
    useState<{ name: string; img_url: string }[]>(mockedCarouselItems)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isGrid, setIsGrid] = useState(true)
  const thirdWidth = Dimensions.get("window").width / 3

  console.log(
    "------------------------------------------------>",
    Constants.expoConfig.extra.apiUrl,
    "<------------------------------------------------"
  )

  // Load first page of products when component mounts or route params change
  useEffect(() => {
    setSelectedPill(undefined)
    loadInitialProducts()
    fetchUserProfile(store.user?.id)
      .then((res) => {
        store.setUser(res.data)
        fetchCartItems(store.user.id)
          .then((res) => {
            store.setCartItems(res.data)
          })
          .catch((err) => {
            console.log(err)
          })
      })
      .catch((err) => {
        console.log(err)
      })
  }, [route.params])

  // Refetch products when selectedPill changes
  useEffect(() => {
    loadInitialProducts(selectedPill)
  }, [selectedPill])

  // Function to load initial products
  const loadInitialProducts = useCallback((pill?: number) => {
    store.setProductsLoading(true)
    setCurrentPage(1)

    fetchProducts(pill, 1, PAGE_SIZE)
      .then((res) => {
        const products = res.data.products || []
        const totalCount = res.data.total_count || 0
        const pages = res.data.total_pages || 1

        store.setProducts({
          products: products,
          total_count: totalCount,
          total_pages: pages,
        })

        setTotalPages(pages)
      })
      .catch((err) => {
        console.log("Failed to fetch products:", err)
      })
      .finally(() => {
        store.setProductsLoading(false)
      })
  }, [])

  // Function to load more products
  const loadMoreProducts = useCallback(async () => {
    // Don't fetch if already fetching, no more pages, or initial loading
    if (
      isFetchingMore ||
      currentPage >= totalPages ||
      store.products_list?.loading
    ) {
      return
    }

    setIsFetchingMore(true)
    const nextPage = currentPage + 1

    try {
      const res = await fetchProducts(undefined, nextPage, PAGE_SIZE)
      const newProducts = res.data.products || []

      // Update store with new products
      store.appendProducts({
        products: newProducts,
        total_count: res.data.total_count,
        total_pages: res.data.total_pages,
        page: nextPage,
      })

      // Update local state
      setCurrentPage(nextPage)
    } catch (err) {
      console.error("Failed to fetch more products:", err)
    } finally {
      setIsFetchingMore(false)
    }
  }, [currentPage, totalPages, isFetchingMore, store.products_list?.loading])

  // Ensure products array exists to prevent "Cannot read property 'length' of undefined" error
  const products = store.products_list?.products || []
  const isLoading = store.products_list?.loading || false

  // Footer component shown during loading or displaying count
  const renderFooter = () => {
    return (
      <Box className='py-4 flex justify-center items-center'>
        {(isLoading || isFetchingMore) && (
          <>
            <ActivityIndicator size='small' color={theme.primary[500]} />
            <Text className='mt-2'>Loading products...</Text>
          </>
        )}
      </Box>
    )
  }

  const pills = [
    { name: "Featured", id: undefined },
    { name: "Comics", id: 6 },
    { name: "Graphic Novels", id: 2 },
    { name: "Manga", id: 4 },
    { name: "Magazines", id: 3 },
    { name: "Cards", id: 7 },
  ]

  return (
    <Box
      className='h-screen w-full pb-24'
      style={{
        backgroundColor: theme.background,
      }}
    >
      {/* Loading overlay */}
      <MasonryList
        data={products}
        scrollEnabled
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <Box>
            <Box className='h-48'>
              <Image
                className='w-36 absolute h-48 z-10 left-1/2 -translate-x-1/2'
                source={require("@/src/assets/icon.png")}
                alt='logo'
                resizeMode='contain'
              />
              <Image
                className='w-full h-48'
                source={{ uri: carouselItems[0].img_url }}
                alt={carouselItems[0].name}
              />
            </Box>
            {/* Navigation Pill */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              horizontal
              className='mr-2 ml-2 mt-4'
            >
              {pills.map((pill) => (
                <Button
                  key={pill.id}
                  onPress={() => {
                    // change results based on pill
                    console.log("pill pressed", pill)
                    setSelectedPill(pill.id)
                    store.setProducts({
                      products: [],
                      total_count: 0,
                      total_pages: 1,
                    })
                  }}
                  variant='outline'
                  style={{
                    borderWidth: 1,
                    borderColor: theme.primary[500],
                    backgroundColor:
                      selectedPill === pill.id
                        ? theme.primary[500]
                        : "transparent",
                    borderRadius: 9999,
                    marginLeft: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter",
                      color:
                        selectedPill === pill.id ? theme.white : theme.text,
                    }}
                  >
                    {pill.name}
                  </Text>
                </Button>
              ))}
            </ScrollView>
            <HStack className='justify-between mr-2 ml-2'>
              <Box className='p-2 mt-4'>
                <Text
                  style={{
                    fontFamily: "Inter",
                    color: theme.text,
                    lineHeight: 24,
                    fontSize: 24,
                    marginTop: 8,
                  }}
                >
                  {selectedPill !== undefined
                    ? `Featured ${
                        pills.find((p) => p.id === selectedPill)?.name ?? ""
                      }`
                    : "Featured Products"}
                </Text>
                {/* <Text>{totalCount} products total</Text> */}
              </Box>
              <HStack space={"xl"} className='p-2 my-4 flex items-center'>
                <Pressable onPress={() => setIsGrid(!isGrid)}>
                  {isGrid ? (
                    <LayoutList size={24} color={theme.text} />
                  ) : (
                    <LayoutGrid size={24} color={theme.text} />
                  )}
                </Pressable>
                <Button
                  onPress={() => {
                    navigation.dispatch(DrawerActions.toggleDrawer())
                  }}
                  variant='link'
                >
                  <Menu size={24} color={theme.text} />
                </Button>
              </HStack>
            </HStack>
          </Box>
        }
        ListFooterComponent={renderFooter()}
        numColumns={!isGrid ? 3 : 1}
        style={{
          columnGap: 12,
          marginHorizontal: 12,
        }}
        contentContainerStyle={{}}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        renderItem={({ item }: { item: ProductT; i: number }) => (
          <Pressable
            key={item.id}
            onPress={() => {
              navigation.navigate("Product", { product: item })
            }}
          >
            <View key={item.id}>
              {!isGrid ? (
                <ProductCard isInCart={false} product={item as ProductT} />
              ) : (
                <HStack space='xs' className='mb-3'>
                  <Image
                    className='aspect-[3/4] w-1/4 rounded-sm'
                    resizeMode='contain'
                    source={{ uri: item.cover_url }}
                    alt={item.title}
                  />
                  <Box>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontFamily: "Inter",
                        color: theme.text,
                        maxWidth: Dimensions.get("window").width - thirdWidth,
                      }}
                      numberOfLines={1}
                      ellipsizeMode='tail'
                      className='text-lg'
                    >
                      {item.title}
                    </Text>
                    <Text style={{ color: theme.text }} className='text-md'>
                      {item.publisher}
                    </Text>
                  </Box>
                </HStack>
              )}
            </View>
          </Pressable>
        )}
      />
    </Box>
  )
}
