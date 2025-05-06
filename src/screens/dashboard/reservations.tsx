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
import { Menu } from "lucide-react-native";
import DashboardLayout from "./_layout";
import {
  fetchProducts,
  fetchProductsByReleaseId,
  fetchReleases,
  addToWantList,
} from "@/src/api/apiEndpoints";
import ReleasesDrawer from "@/src/components/ReleasesDrawer";

import { mockReleaseDates } from "@/src/utils/mock";
import { useNavigation } from "@react-navigation/native";
import { ProductPreview } from "@/src/components/product-preview";

interface Release {
  id: number;
  title: string;
  release_date: string;
  status: string;
  products_count: number;
  reservations_total: number;
  customers_count: number;
}

export default function ReservationsScreen() {
  const navigation = useNavigation();
  const [releaseDates, setReleaseDates] = useState<Release[]>([]);
  const [products, setProducts] = useState<ProductT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedReleaseId, setSelectedReleaseId] = useState<number | null>(
    null
  );

  // Fetch all release dates from API
  const fetchReleaseDatesFromAPI = async () => {
    try {
      setLoading(true);
      const response = await fetchReleases()
        .then((res) => {
          setReleaseDates(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch release dates:", err);
      setError("Failed to load release dates");
      setLoading(false);
    }
  };

  console.log("------------> releases", releaseDates);

  // Find the latest release (by date) with status 'published' or 'closed'
  const getLatestRelease = (entries: Release[]): Release | null => {
    if (!entries || entries.length === 0) return null;
    const validStatuses = ["publish", "close"];
    const filtered = entries.filter((rel) =>
      validStatuses.includes(rel.status)
    );
    if (filtered.length === 0) return null;
    return filtered.reduce((latest, rel) =>
      new Date(rel.release_date) > new Date(latest.release_date) ? rel : latest
    );
  };

  // Clear filters and show latest published/closed release
  const clearFilters = () => {
    const latest = getLatestRelease(releaseDates);
    if (latest) {
      setSelectedReleaseId(latest.id);
      setSelectedDate(latest.release_date);
      loadProductsByRelease(latest.id);
    } else {
      setSelectedReleaseId(null);
      setSelectedDate("");
      loadProductsByRelease(null);
    }
  };

  const loadProductsByRelease = async (id: number | null) => {
    try {
      setLoading(true);
      if (id) {
        const response = await fetchProductsByReleaseId(id);
        setProducts(response.data);
        setLoading(false);
      } else {
        const response = await fetchProducts();
        setProducts(response.data);
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch releases:", err);
      setError("Failed to load releases");
      setLoading(false);
    }
  };

  // On mount: fetch release dates, then select latest and load its releases
  useEffect(() => {
    const initialize = async () => {
      await fetchReleaseDatesFromAPI();
    };
    initialize();
  }, []);

  // When releaseDates are loaded, select latest published/closed and load its releases
  useEffect(() => {
    if (releaseDates.length > 0) {
      const latest = getLatestRelease(releaseDates);
      if (latest) {
        setSelectedDate(latest.release_date);
        setSelectedReleaseId(latest.id);
        loadProductsByRelease(latest.id);
      }
    }
  }, [releaseDates]);

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
    setProducts((prev) =>
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

  // Format date as 'MMM DD, YYYY'
  const formatDateHuman = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleSelectDate = (id: number, date: string) => {
    setSelectedDate(date);
    setSelectedReleaseId(id);
    setShowDrawer(false);
    loadProductsByRelease(id);
  };

  return (
    <DashboardLayout>
      <Box className="h-screen w-full pb-24">
        <ReleasesDrawer
          visible={showDrawer}
          releaseDates={releaseDates
            .filter((release) => release.status !== "draft")
            .map((release) => ({
              id: release.id,
              date: release.release_date,
              count: release.products_count,
            }))}
          selectedReleaseId={selectedReleaseId}
          onClose={toggleDrawer}
          onSelectDate={handleSelectDate}
          onShowAllReleases={clearFilters}
        />

        <MasonryList
          data={products}
          scrollEnabled
          loading={loading}
          ListEmptyComponent={
            loading ? (
              <View className="flex mt-56 mb-4 flex-col items-center" />
            ) : (
              <View className="flex mt-56 mb-4 flex-col items-center">
                <>
                  <Image
                    alt="Comic Odyssey Icon"
                    key="closed"
                    className="w-full max-h-16 scale-[0.8]"
                    resizeMethod="scale"
                    source={ComicOdysseyIcon}
                  />
                  <Text className="mt-4 mb-2">
                    the reservation list is already closed or was not found.
                  </Text>
                  <Text>Please come back on Friday for the new releases!</Text>
                </>
              </View>
            )
          }
          ListHeaderComponent={
            <View className="ml-4 mr-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-bold text-lg">
                  {formatDateHuman(selectedDate)}
                </Text>
                <TouchableOpacity onPress={toggleDrawer} className="p-2">
                  <Menu size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <Text className="mb-2 text-sm">
                {(() => {
                  const selectedRelease = releaseDates.find(
                    (item) => item.id === selectedReleaseId
                  );
                  return selectedRelease ? selectedRelease.title : "";
                })()}
              </Text>
              {/* Highlighted message for past releases */}
              {(() => {
                const latest = getLatestRelease(releaseDates);
                if (
                  latest &&
                  selectedReleaseId &&
                  selectedReleaseId !== latest.id
                ) {
                  return (
                    <View
                      style={{
                        backgroundColor: "#FFF7D6",
                        borderRadius: 6,
                        padding: 10,
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: "#FFE29C",
                      }}
                    >
                      <Text style={{ color: "#7A5C00" }}>
                        This is a past release. To browse the current release,{" "}
                        <Text
                          style={{ fontWeight: "bold", color: "#1A237E" }}
                          onPress={() => {
                            const latest = getLatestRelease(releaseDates);
                            if (latest) {
                              setSelectedReleaseId(latest.id);
                              setSelectedDate(latest.release_date);
                              loadProductsByRelease(latest.id);
                            }
                          }}
                        >
                          press here.
                        </Text>
                      </Text>
                    </View>
                  );
                }
                return null;
              })()}
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
            </View>
          }
          LoadingView={
            <>
              <Image
                alt="Comic Odyssey Icon"
                key="loading"
                className="w-full max-h-16 scale-[0.8] align-center"
                resizeMethod="scale"
                source={ComicOdysseyIcon}
              />
              <Text className="mt-4 text-center mb-2">
                Hang tight, we're loading the latest releases!
              </Text>
            </>
          }
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item, i }) => {
            const product = item as ProductT;
            return (
              <>
                <View className="p-4">
                  <ProductPreview
                    product={product}
                    navigation={navigation}
                    selectedProducts={selectedProducts}
                    isProductReserved={isProductReserved}
                    getQuantityLeft={getQuantityLeft}
                  />
                </View>
                {
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 12,
                    }}
                    onPress={async () => {
                      try {
                        await addToWantList(product.id);
                        alert("Added to your want list!");
                      } catch (e) {
                        alert("Failed to add to want list.");
                      }
                    }}
                  >
                    <Text style={{ color: "#1A237E", fontWeight: "bold" }}>
                      I want this
                    </Text>
                  </TouchableOpacity>
                }
              </>
            );
          }}
        />
      </Box>
    </DashboardLayout>
  );
}
