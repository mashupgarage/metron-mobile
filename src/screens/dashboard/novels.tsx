import { Box } from "@/src/components/ui/box";
import { Image } from "@/src/components/ui/image";
import { Text } from "@/src/components/ui/text";
import { useBoundStore } from "@/src/store";
import { Dimensions, useColorScheme, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
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
import { useEffect, useState } from "react";
import { fetchProducts, fetchUserProfile } from "@/src/api/apiEndpoints";

export default function Novels() {
  const store = useBoundStore();
  const route = useRoute<RouteProp<DashboardStackParams, "Novels">>();
  const navigation = useNavigation<NavigationProp<DashboardStackParams>>();

  const [carouselItems, setCarouselItems] =
    useState<{ name: string; img_url: string }[]>(mockedCarouselItems);

  useEffect(() => {
    fetchProducts(2)
      .then((res) => {
        const list = {
          products: res.data.products,
          total_count: res.data.total_count,
          total_pages: res.data.total_pages,
        };
        store.setNovels(list);
      })
      .catch((err) => {
        console.log(err);
      });

    fetchUserProfile(store.user?.id)
      .then((res) => {
        store.setUser(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [route.params]);

  return (
    <Box className="h-screen w-full pb-24">
      <MasonryList
        data={store.novels_list.products}
        scrollEnabled
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
                  Latest Novels
                </Text>
                <Text>{store.novels_list.total_count} products total</Text>
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
        numColumns={2}
        keyExtractor={(item) => item.id}
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
