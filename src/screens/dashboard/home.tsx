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
import { fetchProducts, fetchUserProfile } from "@/src/api/apiEndpoints";
import Constants from "expo-constants";

export default function Home() {
  const store = useBoundStore();
  const route = useRoute<RouteProp<DashboardStackParams, "Home">>();
  const navigation = useNavigation<NavigationProp<DashboardStackParams>>();

  const [carouselItems, setCarouselItems] =
    useState<{ name: string; img_url: string }[]>(mockedCarouselItems);

  console.log(
    "------------------------------------------------>",
    Constants.expoConfig.extra.apiUrl,
    "<------------------------------------------------"
  );

  // Load first page of products when component mounts or route params change
  useEffect(() => {
    loadProducts(1);

    fetchUserProfile(store.user?.id)
      .then((res) => {
        store.setUser(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [route.params]);

  // Function to load products for a specific page
  const loadProducts = useCallback((page: number) => {
    // Set loading state
    store.setProductsLoading(true);

    fetchProducts(undefined, page)
      .then((res) => {
        const list = {
          products: res.data.products,
          total_count: res.data.total_count,
          total_pages: res.data.total_pages,
          page: page,
        };

        if (page === 1) {
          // Reset the list for page 1
          store.setProducts({
            products: list.products,
            total_count: list.total_count,
            total_pages: list.total_pages,
          });
        } else {
          // Append to existing list for subsequent pages
          store.appendProducts(list);
        }
      })
      .catch((err) => {
        console.log(err);
        store.setProductsLoading(false);
      });
  }, []);

  // Handle end of list reached event to load more products
  const handleLoadMore = useCallback(() => {
    const { current_page, total_pages, loading } = store.products_list;

    // Don't fetch if we're already loading or at the last page
    if (loading || current_page >= total_pages) return;

    // Load the next page
    loadProducts(current_page + 1);
  }, [store.products_list, loadProducts]);

  // Ensure products array exists to prevent "Cannot read property 'length' of undefined" error
  const products = store.products_list?.products || [];
  const isLoading = store.products_list?.loading || false;

  // Footer component shown during loading
  const renderFooter = () => {
    if (!isLoading) return null;

    return (
      <Box className="py-4 flex justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2">Loading more products...</Text>
      </Box>
    );
  };

  return (
    <Box className="h-screen w-full pb-24">
      <MasonryList
        data={products}
        scrollEnabled
        onEndReached={handleLoadMore}
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
                  Latest Products
                </Text>
                <Text>
                  {store.products_list?.total_count || 0} products total
                </Text>
              </Box>
              <Box className="p-2">
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
              </Box>
            </HStack>
          </Box>
        }
        ListFooterComponent={renderFooter()}
        numColumns={2}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        renderItem={({ item, i }) => (
          <Pressable
            onPress={() => {
              navigation.navigate("Product", { product: item as ProductT });
            }}
          >
            <View key={i} className="p-2">
              <ProductCard isInCart={false} product={item as ProductT} />
            </View>
          </Pressable>
        )}
      />
    </Box>
  );
}
