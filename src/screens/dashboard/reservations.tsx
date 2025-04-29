import { Box } from "@/src/components/ui/box";
import { Image } from "@/src/components/ui/image";
import { Text } from "@/src/components/ui/text";
import { Dimensions, useColorScheme, View } from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
import ComicOdysseyIcon from "@/src/assets/icon.png";

import ProductCard from "@/src/components/product";
import { ProductT } from "@/src/utils/types/common";
import { Pressable } from "react-native-gesture-handler";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { DashboardStackParams } from "@/src/utils/types/navigation";
import { Filter } from "lucide-react-native";
import DashboardLayout from "./_layout";

export default function ReservationsScreen() {
  const navigation = useNavigation<NavigationProp<DashboardStackParams>>();
  const screenWidth = Dimensions.get("window").width;
  return (
    <DashboardLayout>
      <Box className="h-screen w-full pb-24">
        <MasonryList
          data={[]}
          scrollEnabled
          ListEmptyComponent={
            <View className="flex mt-48 mb-4 flex-col items-center ml-4 mr-4">
              <Image
                className="w-full max-h-8"
                resizeMethod="scale"
                source={ComicOdysseyIcon}
              />
              <Text className="mt-4 mb-2">
                Sorry, Last week's list is now closed.
              </Text>
              <Text>Please come back on Friday for the new releases!</Text>
            </View>
          }
          ListHeaderComponent={
            <View className="ml-4 mr-4">
              <View className="flex-row justify-between items-center mb-4">
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
              <View className="mb-4 bg-green-200 max-w-[200px] rounded">
                <Text className="text-center green-red-800">
                  RESERVATION AVAILABLE
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
