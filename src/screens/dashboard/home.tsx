import { Box } from "@/src/components/ui/box"
import { Image } from "@/src/components/ui/image"
import { Text } from "@/src/components/ui/text"
import { useBoundStore } from "@/src/store"
import {
  View,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from "react-native"
import MasonryList from "@react-native-seoul/masonry-list"

import ProductCard from "@/src/components/product"
import { ProductT } from "@/src/utils/types/common"
import { Pressable } from "react-native-gesture-handler"
import {
  NavigationProp,
  useNavigation,
  useRoute,
  RouteProp,
  ParamListBase,
} from "@react-navigation/native"
import { HStack } from "@/src/components/ui/hstack"
import { Button, ButtonSpinner, ButtonText } from "@/src/components/ui/button"
import { mockedCarouselItems } from "@/src/utils/mock"
import { useCallback, useEffect, useState } from "react"
import {
  fetchCartItems,
  fetchProducts,
  fetchUserProfile,
  searchMarketplaceProducts,
} from "@/src/api/apiEndpoints"
import Constants from "expo-constants"

import { LayoutGrid, LayoutList } from "lucide-react-native"
import { fonts } from "@/src/theme"

const PAGE_SIZE = 10 // Define standard page size

export default function Home() {
  const store = useBoundStore()
  const theme = useBoundStore((state) => state.theme)
  const route = useRoute<RouteProp<ParamListBase, "Home">>()
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const [selectedPill, setSelectedPill] = useState<number | undefined>(
    undefined
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [carouselItems, setCarouselItems] =
    useState<{ name: string; img_url: string }[]>(mockedCarouselItems)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isGrid, setIsGrid] = useState(true)
  const [isSearchMode, setIsSearchMode] = useState(false)
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
      if (isSearchMode && searchQuery.trim() !== "") {
        // Fetch more search results
        await handleSearch(nextPage)
      } else {
        // Fetch more products
        const res = await fetchProducts(selectedPill, nextPage, PAGE_SIZE)
        const newProducts = res.data.products || []
        store.appendProducts({
          products: newProducts,
          total_count: res.data.total_count,
          total_pages: res.data.total_pages,
          page: nextPage,
        })
        setCurrentPage(nextPage)
      }
    } catch (err) {
      console.error("Failed to fetch more products:", err)
    } finally {
      setIsFetchingMore(false)
    }
  }, [
    currentPage,
    totalPages,
    isFetchingMore,
    store.products_list?.loading,
    isSearchMode,
    searchQuery,
    selectedPill,
  ])

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
            <Text style={[fonts.body, { color: theme.text }]} className='mt-2'>
              Loading products...
            </Text>
          </>
        )}
      </Box>
    )
  }

  const handleSearch = async (page = 1) => {
    if (searchQuery.trim() === "") return
    setIsSearchMode(true)
    if (page === 1) {
      setLoading(true)
      setCurrentPage(1)
    } else {
      setIsFetchingMore(true)
    }
    setError("")
    try {
      const response = await searchMarketplaceProducts(searchQuery, page)
      const productsArray = response.data.products || response.data.data || []
      const totalCount =
        response.data.total_count || response.data.meta?.total || 0
      const totalPagesValue =
        response.data.total_pages || response.data.meta?.last_page || 1
      const currentPageValue =
        response.data.current_page || response.data.meta?.current_page || page
      if (page === 1) {
        store.setProducts({
          products: productsArray,
          total_count: totalCount,
          total_pages: totalPagesValue,
        })
      } else {
        store.appendProducts({
          products: productsArray,
          total_count: totalCount,
          total_pages: totalPagesValue,
          page: currentPageValue,
        })
      }
      setTotalPages(totalPagesValue)
      setCurrentPage(currentPageValue)
    } catch {
      setError("Failed to fetch search results. Please try again.")
    } finally {
      setLoading(false)
      setIsFetchingMore(false)
    }
  }

  // Clear search and restore default product list
  const handleClearSearch = () => {
    setSearchQuery("")
    setIsSearchMode(false)
    setCurrentPage(1)
    setError("")
    loadInitialProducts(selectedPill)
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
            <Box className='h-36'>
              <Image
                className='w-36 absolute h-48 z-10 left-1/2 -translate-x-1/2'
                source={require("@/src/assets/icon.png")}
                alt='logo'
                resizeMode='contain'
              />
              <Image
                className='w-full h-36'
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
                <TouchableOpacity
                  key={pill.id}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 7,
                    borderRadius: 18,
                    marginRight: 8,
                    backgroundColor:
                      selectedPill === pill.id
                        ? theme.primary[500]
                        : theme.background2,
                  }}
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
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      ...fonts.body,
                      color: selectedPill === pill.id ? "#fff" : theme.text,
                      fontWeight: selectedPill === pill.id ? "bold" : "500",
                    }}
                  >
                    {pill.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Box className='p-4 pb-0'>
              <HStack className='w-full'>
                <View
                  style={{
                    position: "relative",
                    flex: 1,
                    marginRight: theme.spacing.sm,
                  }}
                >
                  <TextInput
                    placeholder='Search products...'
                    returnKeyType='search'
                    placeholderTextColor={theme.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={() => handleSearch(1)}
                    style={{
                      backgroundColor: theme.background,
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: theme.border,
                      color: theme.text,
                      paddingRight:
                        isSearchMode && searchQuery.trim() !== "" ? 60 : 36,
                    }}
                  />
                  {isSearchMode && searchQuery.trim() !== "" && (
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        right: 10,
                        top: 12,
                        zIndex: 10,
                      }}
                      onPress={handleClearSearch}
                    >
                      <Text
                        style={{
                          color: theme.primary[500],
                          fontWeight: "bold",
                        }}
                      >
                        Clear
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Button
                  size='xl'
                  style={{ backgroundColor: theme.primary[500] }}
                  onPress={() => handleSearch(1)}
                  disabled={loading || searchQuery.trim() === ""}
                  className='rounded-lg px-4'
                >
                  {loading ? (
                    <ButtonSpinner />
                  ) : (
                    <ButtonText style={[fonts.body, { color: theme.white }]}>
                      Search
                    </ButtonText>
                  )}
                </Button>
              </HStack>
            </Box>
            <HStack className='justify-between mr-2 ml-2'>
              <Box className='p-2 mt-4'>
                <Text
                  style={[
                    fonts.title,
                    {
                      color: theme.text,
                    },
                  ]}
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
