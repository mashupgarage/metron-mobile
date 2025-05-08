import { Box } from "@/src/components/ui/box";
import { Image } from "@/src/components/ui/image";
import { Text } from "@/src/components/ui/text";
import { View, TouchableOpacity } from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
// @ts-ignore
import ComicOdysseyIcon from "@/src/assets/icon.png";
import React, { useEffect, useState } from "react";
import { useWantListStore } from "@/src/store/slices/WantListSlice";
import { ProductT } from "@/src/utils/types/common";
import {
  ClipboardCheck,
  ClipboardIcon,
  ClipboardPaste,
  ClipboardX,
  LucideListCollapse,
  Menu,
} from "lucide-react-native";
import DashboardLayout from "./_layout";
import {
  fetchProducts,
  fetchProductsByReleaseId,
  fetchReleases,
  addToWantList,
  getWantList,
  getReservationList,
} from "@/src/api/apiEndpoints";
import ReleasesDrawer from "@/src/components/ReleasesDrawer";

import { useNavigation } from "@react-navigation/native";
import { Pressable } from "react-native";
import { useBoundStore } from "@/src/store";

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
  const store = useBoundStore();
  const [wantedProductIds, setWantedProductIds] = useState<number[]>([]);
  const navigation = useNavigation();
  const [releaseDates, setReleaseDates] = useState<Release[]>([]);
  const [products, setProducts] = useState<ProductT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false); // NEW
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedReleaseId, setSelectedReleaseId] = useState<number | null>(
    null
  );

  const incrementWantlistCount = useWantListStore(
    (state) => state.incrementWantlistCount
  );

  // Fetch want list on mount
  useEffect(() => {
    getWantList().then((res) => {
      const ids = res.data.want_lists.map((item: any) => item.product_id);
      setWantedProductIds(ids);
    });
  }, []);

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
  const exitMultiSelectMode = () => {
    setIsMultiSelectMode(false);
    setSelectedProducts([]);
  };

  const confirmReservation = () => {
    if (selectedProducts.length === 0) return;
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
    setIsMultiSelectMode(false);
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
      <Box className="h-screen w-full">
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
        <View className="ml-4 mr-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-bold text-lg">
              {formatDateHuman(selectedDate)}
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => {
                  if (isMultiSelectMode) {
                    setIsMultiSelectMode(false);
                    setSelectedProducts([]);
                  } else {
                    setIsMultiSelectMode(true);
                  }
                }}
              >
                <Text className="mr-4">
                  {isMultiSelectMode ? (
                    "Cancel"
                  ) : (
                    <ClipboardCheck size={24} color="#333" />
                  )}
                </Text>
              </TouchableOpacity>
              <>
                {selectedProducts.length > 0 && (
                  <Pressable onPress={confirmReservation}>
                    <Text className="font-bold">
                      Confirm ({selectedProducts.length})
                    </Text>
                  </Pressable>
                )}
              </>
              <TouchableOpacity onPress={toggleDrawer} className="p-2">
                <Menu size={24} color="#333" />
              </TouchableOpacity>
            </View>
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
        </View>
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
          contentContainerStyle={{
            padding: 12,
          }}
          renderItem={({ item, i }) => {
            const product = item as ProductT;
            const isWanted = wantedProductIds.includes(product.id);
            const isSelected = selectedProducts.includes(product.id);
            return (
              <>
                <View
                  className="p-0 m-1"
                  style={
                    isMultiSelectMode && isSelected
                      ? {
                          borderWidth: 1,
                          borderColor: "#1976D2",
                          borderRadius: 4,
                        }
                      : {}
                  }
                >
                  <Pressable
                    onPress={() => {
                      if (isMultiSelectMode) {
                        toggleProductSelection(product.id);
                      } else {
                        getReservationList(store.user?.id).then((res) => {
                          const reservationList = res.data.reservations;
                          // @ts-ignore
                          navigation.navigate("Product", {
                            product: product,
                            fromReservations: true,
                            reservationId: selectedReleaseId,
                            reservationList,
                          });
                        });
                      }
                    }}
                    style={({ pressed }) => [
                      { opacity: pressed ? 0.7 : 1 },
                      isMultiSelectMode && isSelected
                        ? {
                            borderWidth: 4,
                            borderColor: "#1976D2",
                            borderRadius: 12,
                          }
                        : {},
                    ]}
                  >
                    <Box className="mb-2">
                      <View style={{ padding: 4, margin: 8, marginBottom: 0 }}>
                        <Image
                          source={{ uri: product.cover_url }}
                          alt={product.id.toString()}
                          className="h-48 w-full rounded-md"
                          resizeMode="cover"
                          style={
                            isMultiSelectMode && isSelected
                              ? {
                                  borderWidth: 2,
                                  borderColor: "#1A237E",
                                  borderRadius: 8,
                                }
                              : {}
                          }
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
                        </View>
                        <View className="flex-row justify-between items-center mt-1">
                          <View style={{ alignItems: "flex-end" }}>
                            <Text className="mr-4">
                              {getQuantityLeft(product) === 0
                                ? "Out of Stock"
                                : `${getQuantityLeft(product)} left`}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Box>
                  </Pressable>
                </View>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 12,
                    opacity: isWanted ? 0.5 : 1,
                  }}
                  disabled={isWanted}
                  onPress={async () => {
                    try {
                      await addToWantList(product.id);
                      setWantedProductIds([...wantedProductIds, product.id]);
                      incrementWantlistCount();
                      alert("Added to your want list!");
                    } catch (e) {
                      console.log(e);
                      alert("Failed to add to want list.");
                    }
                  }}
                >
                  <Text style={{ color: "#1A237E", fontWeight: "bold" }}>
                    {isWanted ? "Wanted!" : "I want this"}
                  </Text>
                </TouchableOpacity>
              </>
            );
          }}
        />
        <Box className="h-40" />
      </Box>
    </DashboardLayout>
  );
}
