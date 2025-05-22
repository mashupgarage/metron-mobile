import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { searchMarketplaceProducts } from "@/src/api/apiEndpoints";
import { Input, InputField } from "@/src/components/ui/input";
import { Button, ButtonText, ButtonSpinner } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Image } from "@/src/components/ui/image";
import { ProductT } from "@/src/utils/types/common";
import { HStack } from "@/src/components/ui/hstack";
import { VStack } from "@/src/components/ui/vstack";
import { Box } from "@/src/components/ui/box";
import MasonryList from "@react-native-seoul/masonry-list";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { DashboardStackParams } from "@/src/utils/types/navigation";
import DashboardLayout from "./_layout";
import ProductCard from "@/src/components/product";
import { Pressable } from "react-native-gesture-handler";

export default function Search() {
  const navigation = useNavigation<NavigationProp<DashboardStackParams>>();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<ProductT[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const handleSearch = async (page = 1) => {
    if (searchQuery.trim() === "") return;

    if (page === 1) {
      setLoading(true);
    } else {
      setIsFetchingMore(true);
    }
    setError("");

    try {
      const response = await searchMarketplaceProducts(searchQuery, page);

      // Check what structure the data is in and handle accordingly
      const productsArray = response.data.products || response.data.data || [];

      // Access products array correctly
      if (page === 1) {
        setProducts(productsArray);
      } else {
        setProducts((prev) => [...prev, ...productsArray]);
      }

      // Access page info and total counts correctly
      const totalPagesValue =
        response.data.total_pages || response.data.meta?.last_page || 1;
      const currentPageValue =
        response.data.current_page || response.data.meta?.current_page || page;
      const totalItems =
        response.data.total_count ||
        response.data.meta?.total ||
        productsArray.length;

      setTotalPages(totalPagesValue);
      setTotalCount(totalItems);
      setHasMore(page < totalPagesValue);
      setCurrentPage(currentPageValue);
    } catch (err) {
      setError("Failed to fetch search results. Please try again.");
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const loadMoreProducts = () => {
    if (loading || isFetchingMore || !hasMore) return;
    handleSearch(currentPage + 1);
  };

  const renderFooter = () => {
    return (
      <Box className="py-4 flex justify-center items-center">
        {(loading || isFetchingMore) && (
          <>
            <ActivityIndicator size="small" color="#0000ff" />
            <Text className="mt-2">Loading products...</Text>
          </>
        )}

        {products.length > 0 && (
          <Text className="text-sm text-gray-500 mt-2">
            Showing {products.length} of {totalCount} products
          </Text>
        )}
      </Box>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <VStack className="items-center justify-center p-4">
        {searchQuery !== "" ? (
          <Text className="text-center text-gray-500 text-base">
            No products found matching "{searchQuery}"
          </Text>
        ) : (
          <>
            <Text className="text-center mb-4 text-gray-600 text-xl font-medium">
              Search for products
            </Text>
          </>
        )}
      </VStack>
    );
  };

  return (
    <DashboardLayout>
      <Box className="h-screen w-full pb-24">
        <VStack className="w-full px-4 mb-4">
          <HStack className="w-full mb-6">
            <Input
              className="flex-1 mr-2 bg-white rounded-lg"
              variant="outline"
              size="lg"
            >
              <InputField
                placeholder="Search products..."
                returnKeyType="search"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => handleSearch(1)}
                className="h-12"
              />
            </Input>
            <Button
              onPress={() => handleSearch(1)}
              disabled={loading || searchQuery.trim() === ""}
              className="bg-blue-900 rounded-lg h-11 px-4"
            >
              {loading ? <ButtonSpinner /> : <ButtonText>Search</ButtonText>}
            </Button>
          </HStack>

          {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}
        </VStack>

        {products.length > 0 ? (
          <MasonryList
            data={products}
            scrollEnabled
            onEndReached={loadMoreProducts}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter()}
            numColumns={2}
            keyExtractor={(item, index) => `${item.id}_${index}`}
            contentContainerStyle={{
              paddingHorizontal: 10,
              paddingBottom: 100,
            }}
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
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              height: "70%",
            }}
          >
            {renderEmptyState()}
          </View>
        )}
      </Box>
    </DashboardLayout>
  );
}
