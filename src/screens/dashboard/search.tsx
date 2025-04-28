import { useBoundStore } from "@/src/store";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, FlatList, Pressable, View } from "react-native";
import { useState, useEffect } from "react";
import { Box } from "@/src/components/ui/box";
import { Text } from "@/src/components/ui/text";
import { HStack } from "@/src/components/ui/hstack";
import { VStack } from "@/src/components/ui/vstack";
import { Input, InputField, InputSlot, InputIcon } from "@/src/components/ui/input";
import { SearchIcon } from "@/src/components/ui/icon";
import ProductCard from "@/src/components/product";
import { ProductT } from "@/src/utils/types/common";
import { searchProduct } from "@/src/api/apiEndpoints";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { DashboardStackParams } from "@/src/utils/types/navigation";

export default function Search() {
  const store = useBoundStore();
  const navigation = useNavigation<NavigationProp<DashboardStackParams>>();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const response = await searchProduct(searchQuery);
      setSearchResults(response.data || []);
    } catch (error: any) {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <VStack space="md" className="w-full px-4 py-4">
        <Text className="text-2xl font-bold mb-4">Search Products</Text>
        
        <HStack space="sm" className="w-full">
          <Input className="w-full flex-1" size="md" variant="outline">
            <InputField
              placeholder="Search for products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <InputSlot onPress={handleSearch}>
              <InputIcon as={SearchIcon} />
            </InputSlot>
          </Input>
        </HStack>

        {isLoading ? (
          <Box className="items-center justify-center py-8">
            <Text>Loading results...</Text>
          </Box>
        ) : hasSearched ? (
          searchResults.length > 0 ? (
            <Box className="flex-1 w-full">
              <Text className="mb-4">{searchResults.length} products found</Text>
              <FlatList
                data={searchResults}
                numColumns={2}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      navigation.navigate("Product", { product: item });
                    }}
                  >
                    <Box className="ml-1 mr-1 mb-4">
                      <ProductCard isInCart={false} product={item} />
                    </Box>
                  </Pressable>
                )}
              />
            </Box>
          ) : (
            <Box className="items-center justify-center py-8">
              <Text>No products found for "{searchQuery}"</Text>
            </Box>
          )
        ) : (
          <Box className="items-center justify-center py-8">
            <Text>Enter a search term to find products</Text>
          </Box>
        )}
      </VStack>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
