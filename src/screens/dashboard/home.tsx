import { Box } from "@/src/components/ui/box";
import { Image } from "@/src/components/ui/image";
import { Text } from "@/src/components/ui/text";
import { useBoundStore } from "@/src/store";
import { useColorScheme, View, ActivityIndicator } from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";

import ProductCard from "@/src/components/product";
import { ProductT } from "@/src/utils/types/common";
import { Pressable } from "react-native-gesture-handler";
import {
  NavigationProp,
  useNavigation,
  DrawerActions,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { DashboardStackParams } from "@/src/utils/types/navigation";
import { HStack } from "@/src/components/ui/hstack";
import { Button } from "@/src/components/ui/button";
import { Menu } from "lucide-react-native";
import { mockedCarouselItems } from "@/src/utils/mock";
import { useCallback, useEffect, useState } from "react";
import {
  fetchCartItems,
  fetchProducts,
  fetchUserProfile,
} from "@/src/api/apiEndpoints";
import Constants from "expo-constants";

import { LayoutGrid, LayoutList } from "lucide-react-native";

const PAGE_SIZE = 10; // Define standard page size

export default function Home() {
  const store = useBoundStore();
  const colorScheme = useColorScheme();
  const route = useRoute<RouteProp<DashboardStackParams, "Home">>();
  const navigation = useNavigation<NavigationProp<DashboardStackParams>>();

  const [carouselItems, setCarouselItems] =
    useState<{ name: string; img_url: string }[]>(mockedCarouselItems);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isGrid, setIsGrid] = useState(true);

  console.log(
    "------------------------------------------------>",
    Constants.expoConfig.extra.apiUrl,
    "<------------------------------------------------"
  );

  // Load first page of products when component mounts or route params change
  useEffect(() => {
    loadInitialProducts();
    fetchUserProfile(store.user?.id)
      .then((res) => {
        store.setUser(res.data);
        fetchCartItems(store.user.id)
          .then((res) => {
            store.setCartItems(res.data);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [route.params]);

  // Function to load initial products
  const loadInitialProducts = useCallback(() => {
    store.setProductsLoading(true);
    setCurrentPage(1);

    fetchProducts(undefined, 1, PAGE_SIZE)
      .then((res) => {
        const products = res.data.products || [];
        const totalCount = res.data.total_count || 0;
        const pages = res.data.total_pages || 1;

        store.setProducts({
          products: products,
          total_count: totalCount,
          total_pages: pages,
        });

        setTotalPages(pages);
      })
      .catch((err) => {
        console.log("Failed to fetch products:", err);
      })
      .finally(() => {
        store.setProductsLoading(false);
      });
  }, []);

  // Function to load more products
  const loadMoreProducts = useCallback(async () => {
    // Don't fetch if already fetching, no more pages, or initial loading
    if (
      isFetchingMore ||
      currentPage >= totalPages ||
      store.products_list?.loading
    ) {
      return;
    }

    setIsFetchingMore(true);
    const nextPage = currentPage + 1;

    try {
      const res = await fetchProducts(undefined, nextPage, PAGE_SIZE);
      const newProducts = res.data.products || [];

      // Update store with new products
      store.appendProducts({
        products: newProducts,
        total_count: res.data.total_count,
        total_pages: res.data.total_pages,
        page: nextPage,
      });

      // Update local state
      setCurrentPage(nextPage);
    } catch (err) {
      console.error("Failed to fetch more products:", err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [currentPage, totalPages, isFetchingMore, store.products_list?.loading]);

  // Ensure products array exists to prevent "Cannot read property 'length' of undefined" error
  const products = store.products_list?.products || [];
  const isLoading = store.products_list?.loading || false;
  const totalCount = store.products_list?.total_count || 0;

  // Footer component shown during loading or displaying count
  const renderFooter = () => {
    return (
      <Box className="py-4 flex justify-center items-center">
        {(isLoading || isFetchingMore) && (
          <>
            <ActivityIndicator size="small" color="#0000ff" />
            <Text className="mt-2">Loading products...</Text>
          </>
        )}

        <Text className="text-sm text-gray-500 mt-2">
          Showing {products.length} of {totalCount} products
        </Text>
      </Box>
    );
  };

  return (
    <Box
      className="h-screen w-full pb-24"
      style={{
        backgroundColor: useColorScheme() === "dark" ? "#121212" : "#fff",
      }}
    >
      <MasonryList
        data={products}
        scrollEnabled
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <Box>
            <Box className="h-48">
              <Image
                className="w-full h-48"
                source={{ uri: carouselItems[0].img_url }}
                alt={carouselItems[0].name}
              />
            </Box>
            <HStack className="justify-between mr-2 ml-2">
              <Box className="p-2">
                <Text className="text-primary-400 text-2xl font-bold ">
                  Featured Products
                </Text>
                <Text>{totalCount} products total</Text>
              </Box>
              <HStack space={"xl"} className="p-2 flex items-center">
                <Pressable onPress={() => setIsGrid(!isGrid)}>
                  {isGrid ? (
                    <LayoutList
                      size={24}
                      color={
                        useColorScheme() === "dark" ? "#FFFFFF" : "#202020"
                      }
                    />
                  ) : (
                    <LayoutGrid
                      size={24}
                      color={
                        useColorScheme() === "dark" ? "#FFFFFF" : "#202020"
                      }
                    />
                  )}
                </Pressable>
                <Button
                  onPress={() => {
                    navigation.dispatch(DrawerActions.toggleDrawer());
                  }}
                  variant="link"
                >
                  <Menu
                    size={24}
                    color={useColorScheme() === "dark" ? "#FFFFFF" : "#202020"}
                  />
                </Button>
              </HStack>
            </HStack>
          </Box>
        }
        ListFooterComponent={renderFooter()}
        numColumns={!isGrid ? 2 : 1}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        renderItem={({ item, i }: { item: ProductT; i: number }) => (
          <Pressable
            onPress={() => {
              navigation.navigate("Product", { product: item });
            }}
          >
            <View key={i} className="p-2">
              {!isGrid ? (
                <ProductCard isInCart={false} product={item as ProductT} />
              ) : (
                <HStack space="xl">
                  <Image
                    source={{ uri: item.cover_url_large }}
                    alt={item.title}
                  />
                  <Box>
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
                        maxWidth: 240,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        color: colorScheme === "dark" ? "#FFFFFF" : "#202020",
                      }}
                    >
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
  );
}
