import { Box } from "@/src/components/ui/box";
import { Text } from "@/src/components/ui/text";
import { useBoundStore } from "@/src/store";
import { useColorScheme } from "react-native";
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
import { Button, ButtonText } from "@/src/components/ui/button";
import { Filter, Menu } from "lucide-react-native";
import { mockedCarouselItems } from "@/src/utils/mock";
import { useEffect, useState } from "react";
import { Modal, ModalBackdrop, ModalContent } from "@/src/components/ui/modal";
import { FilterModal } from "@/src/components/modal/filter";
import { fetchProducts } from "@/src/api/apiEndpoints";

export default function Comics() {
  const store = useBoundStore();
  const navigation = useNavigation<NavigationProp<DashboardStackParams>>();
  const [showModal, setShowModal] = useState(false);

  const [carouselItems, setCarouselItems] =
    useState<{ name: string; img_url: string }[]>(mockedCarouselItems);
  const [products, setProducts] = useState<ProductT[]>([]);

  useEffect(() => {
    fetchProducts(6)
      .then((res) => {
        const result = res;
        const rest = { ...result, data: [] };
        console.log("products", result);
        setProducts(res.data);
      })
      .catch((err) => {
        console.log("products error", err);
      });
  }, []);

  return (
    <Box className="h-screen w-full pb-24">
      <MasonryList
        data={products}
        scrollEnabled
        ListHeaderComponent={
          <Box className="pt-12">
            <HStack className="justify-between mr-2 ml-2">
              <Box className="p-2">
                <Text className="text-primary-400 text-2xl font-bold ">
                  Comics
                </Text>
                <Text>N products total</Text>
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
            <HStack className="justify-between m-4">
              <Button
                onPress={() => {
                  setShowModal(!showModal);
                }}
                variant="link"
              >
                <Filter
                  color={useColorScheme() === "dark" ? "#FFFFFF" : "#202020"}
                  size={14}
                />
                <ButtonText>Filter</ButtonText>
              </Button>
              <Box />
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
            <Box key={i} className="ml-1 mr-1 mb-4">
              <ProductCard isInCart={false} product={item as ProductT} />
            </Box>
          </Pressable>
        )}
      />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalBackdrop />
        <ModalContent>
          {/* <FilterModal
            byTypeOptions={[
              {
                label: "Graphic Novel",
                value: "graphic_novel",
              },
              {
                label: "Manga",
                value: "manga",
              },
              {
                label: "Action Figure & Collectibles",
                value: "action_figure",
              },
              {
                label: "Comics",
                value: "comics",
              },
              {
                label: "Cards",
                value: "cards",
              },
              {
                label: "Card Packs/Boxes",
                value: "card_packs",
              },
              {
                label: "All Categories",
                value: "all",
              },
            ]}
            byPublisherOptions={[
              {
                label: "Marvel Comics",
                value: "marvel",
              },
              {
                label: "DC comics",
                value: "dc",
              },
              {
                label: "Image comics",
                value: "image",
              },
              {
                label: "Dark Horse",
                value: "dark_horse",
              },
              {
                label: "IDW Publishing",
                value: "idw",
              },
              {
                label: "Boom! Studios",
                value: "boom",
              },
              {
                label: "Dynamite Entertainment",
                value: "dynamite",
              },
              {
                label: "Valiant Entertainment LLC",
                value: "valiant",
              },
              {
                label: "All Publishers",
                value: "all",
              },
            ]}
          /> */}
        </ModalContent>
      </Modal>
    </Box>
  );
}
