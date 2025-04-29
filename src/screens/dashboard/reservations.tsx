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
} from "@react-navigation/native";
import { DashboardStackParams } from "@/src/utils/types/navigation";
import { HStack } from "@/src/components/ui/hstack";
import { Button } from "@/src/components/ui/button";
import { Filter, Menu } from "lucide-react-native";
import { mockedCarouselItems } from "@/src/utils/mock";
import { useEffect, useState } from "react";
import {
  fetchProducts,
  fetchReleases,
  fetchUserProfile,
} from "@/src/api/apiEndpoints";
import DashboardLayout from "./_layout";

export default function ReservationsScreen() {
  const store = useBoundStore();
  const navigation = useNavigation<NavigationProp<DashboardStackParams>>();

  return (
    <DashboardLayout>
      <Box className="h-screen w-full pb-24">
        <MasonryList
          data={store.products}
          scrollEnabled
          ListHeaderComponent={
            <View className="ml-4 mr-4">
              <View className="flex-row justify-between items-center">
                <Text className="font-bold text-xl">Latest Release</Text>
                <View className="mr-2">
                  <Filter
                    size={24}
                    color={useColorScheme() === "dark" ? "#FFFFFF" : "#4E4E4E"}
                  />
                </View>
              </View>
              <Text className="mb-2 text-sm">
                FINAL ORDER CUT OFF (F.O.C.) for titles arriving MMM DD / MMM DD
                YYYY
              </Text>
              <View className="mb-4 bg-red-200 max-w-[200px] rounded">
                <Text className="text-center text-red-800">
                  RESERVATION CLOSED
                </Text>
              </View>
            </View>
          }
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item, i }) => (
            <Pressable
              onPress={() => {
                navigation.navigate("Product", { product: item as ProductT });
              }}
            >
              <Box key={i} className="ml-1 mr-1 mb-4">
                <ProductCard isInCart={false} product={item as ProductT} />
              </Box>
            </Pressable>
          )}
        />
      </Box>
    </DashboardLayout>
  );
}
