import { Box } from "@/src/components/ui/box";
import { Image } from "@/src/components/ui/image";
import { Text } from "@/src/components/ui/text";
import { useBoundStore } from "@/src/store";
import { Dimensions, useColorScheme } from "react-native";
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
import { Menu } from "lucide-react-native";
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
          ListHeaderComponent={<Text>Reservations</Text>}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item, i }) => <></>}
        />
      </Box>
    </DashboardLayout>
  );
}
