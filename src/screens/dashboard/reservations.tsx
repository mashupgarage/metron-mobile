import { Box } from "@/src/components/ui/box";
import { Image } from "@/src/components/ui/image";
import { Text } from "@/src/components/ui/text";
import { View, TouchableOpacity } from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
// @ts-ignore
import ComicOdysseyIcon from "@/src/assets/icon.png";
import React, { useEffect, useState } from "react";
import { ProductT } from "@/src/utils/types/common";
import { Pressable } from "react-native-gesture-handler";
import DashboardLayout from "./_layout";
import { fetchReleases } from "@/src/api/apiEndpoints";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { DashboardStackParams } from "@/src/utils/types/navigation";
import { Menu } from "lucide-react-native";
import DashboardLayout from "./_layout";
import { fetchReleases, fetchReleasesByDate } from "@/src/api/apiEndpoints";
import { mockReleases, mockReleaseDates, mockReleasesByDate } from "@/src/utils/mock";
import ReleasesDrawer from "@/src/components/ReleasesDrawer";

export default function ReservationsScreen() {
  const [releases, setReleases] = useState<ProductT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedDate, setSelectedDate] = useState(mockReleaseDates[0]?.date || '');
  const [selectedReleaseId, setSelectedReleaseId] = useState<number | null>(mockReleaseDates[0]?.id || null);

  // Load initial releases
  useEffect(() => {
    setReleases([]);
    setLoading(false);

    const loadReleases = async () => {
      try {
        setLoading(true);
        const response = await fetchReleases();
        setReleases(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch releases:", err);
        setError("Failed to load releases");
      } finally {
        setLoading(false);
      }
    };

    loadReleases();
  }, []);

  // Function to load all releases
  const loadReleases = async () => {
    try {
      setLoading(true);
      
      // Using mock data until API is working
      setReleases(mockReleases);
      setError(null);
      
      // Commenting out API call for now due to auth issues
      /*
      const response = await fetchReleases();
      setReleases(response.data);
      */
    } catch (err) {
      console.error("Failed to fetch releases:", err);
      setError("Failed to load releases");
    } finally {
      setLoading(false);
    }
  };

  // Function to clear filters and show all releases
  const clearFilters = () => {
    setSelectedReleaseId(null);
    setSelectedDate('ALL RELEASES');
    loadReleases();
  };

  // Function to load releases by specific date ID
  const loadReleasesByDate = async (releaseId: number) => {
    try {
      setLoading(true);
      
      // Use the mockReleasesByDate object to get releases for the specific date
      if (releaseId in mockReleasesByDate) {
        setReleases(mockReleasesByDate[releaseId as keyof typeof mockReleasesByDate]);
      } else {
        // Fallback to all releases if date not found
        setReleases(mockReleases);
      }
      
      // Commenting out API call for now
      /*
      const response = await fetchReleasesByDate(releaseId.toString());
      setReleases(response.data);
      */
      
      setError(null);
    } catch (err) {
      console.error(`Failed to fetch releases for id ${releaseId}:`, err);
      setError("Failed to load releases for selected date");
    } finally {
      setLoading(false);
    }
  };

  // Format for displaying dates
  const formatReleaseDate = () => {
    const now = new Date();
    const month = now
      .toLocaleString("default", { month: "short" })
      .toUpperCase();
    const day = now.getDate();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = nextWeek
      .toLocaleString("default", { month: "short" })
      .toUpperCase();
    const nextDay = nextWeek.getDate();
    const year = nextWeek.getFullYear();

    return `${month} ${day}/${nextMonth} ${nextDay} ${year}`;
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const confirmReservation = () => {
    if (selectedProducts.length === 0) return;

    // Update the reserved status for selected products
    setReleases((prev) =>
      prev.map((product) => {
        if (selectedProducts.includes(product.id)) {
          return {
            ...product,
            meta_attributes: {
              ...product.meta_attributes,
              reserved: true,
            },
          };
        }
        return product;
      })
    );

    // Clear selections after reservation
    setSelectedProducts([]);
  };

  const isProductReserved = (product: ProductT) => {
    return product.meta_attributes?.reserved === true;
  };

  const getQuantityLeft = (product: ProductT) => {
    return product.quantity || 0;
  };

  const toggleDrawer = () => {
    setShowDrawer(!showDrawer);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setShowDrawer(false);
    
    // Find the release ID from the mockReleaseDates array
    const selectedRelease = mockReleaseDates.find(item => item.date === date);
    if (selectedRelease) {
      setSelectedReleaseId(selectedRelease.id);
      loadReleasesByDate(selectedRelease.id);
    }
  };

  return (
    <DashboardLayout>
      <Box className="h-screen w-full pb-24">
        <ReleasesDrawer 
          visible={showDrawer}
          releaseDates={mockReleaseDates}
          onClose={toggleDrawer}
          onSelectDate={handleSelectDate}
          onShowAllReleases={clearFilters}
        />
        
        <MasonryList
          data={releases}
          scrollEnabled
          ListEmptyComponent={
            <View className="flex mt-56 mb-4 flex-col items-center">
              {loading ? (
                <>
                  <Image
                    alt="Comic Odyssey Icon"
                    key="loading"
                    className="w-full max-h-16 scale-[0.8]"
                    resizeMethod="scale"
                    source={ComicOdysseyIcon}
                  />
                  <Text className="mt-4 mb-2">
                    Hang tight, we're loading the latest releases!
                  </Text>
                </>
              ) : error ? (
                <>
                  <Image
                    key="error"
                    alt="Comic Odyssey Icon"
                    className="w-full max-h-16 scale-[0.8]"
                    resizeMethod="scale"
                    source={ComicOdysseyIcon}
                  />
                  <Text className="mt-4 mb-2">Sorry! Something went wrong</Text>
                  <Text className="mb-2">{error}</Text>
                </>
              ) : (
                <>
                  <Image
                    alt="Comic Odyssey Icon"
                    key="closed"
                    className="w-full max-h-16 scale-[0.8]"
                    resizeMethod="scale"
                    source={ComicOdysseyIcon}
                  />
                  <Text className="mt-4 mb-2">
                    Sorry, Last week's list is now closed.
                  </Text>
                  <Text>Please come back on Friday for the new releases!</Text>
                </>
              )}
            </View>
          }
          ListHeaderComponent={
            <View className="ml-4 mr-4">
              <Text className="mb-2 text-sm">
                FINAL ORDER CUT OFF (F.O.C.) for titles arriving{" "}
                {formatReleaseDate()}
              </Text>
              <View className="flex-row items-center justify-between mb-4">
                {selectedProducts.length > 0 && (
                  <TouchableOpacity
                    onPress={confirmReservation}
                    className="bg-blue-900 py-2 px-4 rounded-md"
                  >
                    <Text className="text-white font-bold">
                      Reserve ({selectedProducts.length})
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {releases.length > 0 && (
                <Text className="mb-2 font-bold">
                  Total Products: {releases.length}
                </Text>
              )}
            </View>
          }
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item, i }) => {
            const product = item as ProductT;
            return (
              <Pressable
                onPress={() => toggleProductSelection(product.id)}
                style={({ pressed }) => [
                  { opacity: pressed ? 0.7 : 1 },
                  selectedProducts.includes(product.id)
                    ? {
                        borderWidth: 2,
                        borderColor: "rgb(43,100,207)",
                        borderRadius: 8,
                        padding: 6,
                        margin: 8,
                      }
                    : { padding: 6, margin: 8 },
                ]}
              >
                <Box className="mb-2">
                  <View>
                    <Image
                      source={{ uri: product.cover_url }}
                      alt={product.id.toString()}
                      className="h-48 w-full rounded-md"
                      resizeMode="cover"
                    />
                    <View className="mt-2">
                      <Text numberOfLines={1} className="font-bold">
                        {product.title}
                      </Text>
                      <Text className="text-green-700 font-bold">
                        {product.formatted_price}
                      </Text>
                      <Text numberOfLines={1} className="text-gray-600">
                        {product.creators}
                      </Text>

                      <View className="flex-row justify-between items-center mt-1">
                        {isProductReserved(product) ? (
                          <View className="bg-green-200 px-3 py-1 rounded">
                            <Text className="text-green-800">Reserved</Text>
                          </View>
                        ) : null}
                        <Text className="mr-4">
                          {getQuantityLeft(product)} left
                        </Text>
                      </View>

                      <Text className="text-gray-600 text-sm mt-1">
                        Pickup:{" "}
                        {(product.meta_attributes as any)?.pickup_date || "N/A"}
                      </Text>
                    </View>
                  </View>
                </Box>
              </Pressable>
            );
          }}
        />
      </Box>
    </DashboardLayout>
  );
}


