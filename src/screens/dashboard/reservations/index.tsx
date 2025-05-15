import { Box } from "@/src/components/ui/box";
import { Image } from "@/src/components/ui/image";
import { Text } from "@/src/components/ui/text";
import {
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
// @ts-ignore
import ComicOdysseyIcon from "@/src/assets/icon.png";
import React, { useEffect, useState, useCallback } from "react";
import { useWantListStore } from "@/src/store/slices/WantListSlice";
import { ProductT, SearchOptions } from "@/src/utils/types/common";
import { ClipboardCheck, Menu, Search, X, Check } from "lucide-react-native";
import DashboardLayout from "../_layout";
import { useToast, Toast, ToastTitle } from "@/src/components/ui/toast";
import {
  fetchProducts,
  fetchProductsByReleaseId,
  fetchReleases,
  addToWantList,
  getWantList,
  getReservationList,
  addToReservation,
  confirmReservationList,
  searchReservationProducts,
} from "@/src/api/apiEndpoints";
import ReleasesDrawer from "@/src/components/ReleasesDrawer";
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
} from "@/src/components/ui/checkbox";

import { useNavigation } from "@react-navigation/native";
import { Pressable } from "react-native";
import { useBoundStore } from "@/src/store";
import { debounce } from "lodash";
import Constants from "expo-constants";

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
  const toast = useToast();
  const [wantedProductIds, setWantedProductIds] = useState<number[]>([]);
  const navigation = useNavigation();
  const [releaseDates, setReleaseDates] = useState<Release[]>([]);
  const [products, setProducts] = useState<ProductT[]>([]);
  // Products already reserved in the current view
  const reservedProductIds = products
    .filter((p) => p.meta_attributes?.reserved)
    .map((p) => p.id);
  // Products from the user's reservation list (across all releases)
  const [userReservationProductIds, setUserReservationProductIds] = useState<
    number[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedReleaseId, setSelectedReleaseId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [confirmationProducts, setConfirmationProducts] = useState<ProductT[]>(
    []
  );

  const incrementWantlistCount = useWantListStore(
    (state) => state.incrementWantlistCount
  );

  useEffect(() => {
    getWantList().then((res) => {
      const ids = res.data.want_lists.map((item: any) => item.product_id);
      setWantedProductIds(ids);
    });

    // Get user's reservation list to prevent duplicate reservations
    if (store.user?.id) {
      getReservationList(store.user.id)
        .then((res) => {
          console.log("Reservation list response:", res.data.reservations);
          const reservationProducts = res.data.reservations || [];
          // Extract product IDs from the reservation items
          // The response shows product as [Object], so we need to access product.id
          const productIds = reservationProducts
            .map((item: any) => item.product?.id)
            .filter((id) => id !== undefined);
          setUserReservationProductIds(productIds);
          store.setOrdersCount(res.data.metadata?.total_count || 0);
        })
        .catch((err) => {
          console.error("Failed to fetch reservation list:", err);
        });
    }
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

  // Check if the current selected release is a past/old release
  const isOldRelease = (): boolean => {
    const latest = getLatestRelease(releaseDates);
    return Boolean(
      latest && selectedReleaseId && selectedReleaseId !== latest.id
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

  useEffect(() => {
    const initialize = async () => {
      await fetchReleaseDatesFromAPI();
    };
    initialize();
  }, []);

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

  const toggleProductSelection = (productId: number) => {
    // Prevent selecting if viewing a past release
    if (isOldRelease()) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="warning">
            <ToastTitle>Cannot reserve from past releases</ToastTitle>
          </Toast>
        ),
      });
      return;
    }

    // Prevent selecting if product is already in user's reservation list
    if (userReservationProductIds.includes(productId)) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="warning">
            <ToastTitle>Already in your reservation list</ToastTitle>
          </Toast>
        ),
      });
      return;
    }

    // Toggle selection for valid products
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const showConfirmationDialog = () => {
    if (selectedProducts.length === 0) return;

    // Get the selected product objects from the products list
    const productsToConfirm = products.filter((product) =>
      selectedProducts.includes(product.id)
    );

    // Reset unchecked products list when opening modal
    setUncheckedProducts([]);
    setConfirmationProducts(productsToConfirm);
    setShowConfirmationModal(true);
  };

  const confirmReservation = async () => {
    try {
      // Close modal first
      setShowConfirmationModal(false);

      // Get only the product IDs that are still checked in the confirmation modal
      const finalSelectedProducts = confirmationProducts
        .filter((p) => !uncheckedProducts.includes(p.id))
        .map((p) => p.id);

      if (finalSelectedProducts.length === 0) {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={"toast-" + id} action="warning">
              <ToastTitle>No products selected for reservation</ToastTitle>
            </Toast>
          ),
        });
        return;
      }

      // Step 1: Add all selected products to reservation list and collect reservation IDs
      const addToReservationResponses = await Promise.all(
        finalSelectedProducts.map((productId) =>
          addToReservation(productId, 1, selectedReleaseId)
        )
      );

      // Extract reservation IDs from the responses
      const reservationIds = addToReservationResponses.map(
        (response) => response.data.id
      );

      // Step 2: Confirm the reservation by submitting it to the backend
      await confirmReservationList(
        selectedReleaseId,
        reservationIds,
        finalSelectedProducts
      );

      // Update local products state to show as reserved
      setProducts((prev) =>
        prev.map((product) => {
          if (finalSelectedProducts.includes(product.id)) {
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

      // Also update the userReservationProductIds to mark these as already reserved
      setUserReservationProductIds((prevIds) => [
        ...prevIds,
        ...finalSelectedProducts,
      ]);

      setIsMultiSelectMode(false);
      setSelectedProducts([]);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="success">
            <ToastTitle>Reserved successfully!</ToastTitle>
          </Toast>
        ),
      });

      // Refresh the full reservation list to ensure everything is in sync
      if (store.user?.id) {
        getReservationList(store.user.id)
          .then((res) => {
            const reservationProducts = res.data.reservations || [];
            const productIds = reservationProducts
              .map((item: any) => item.product?.id)
              .filter((id) => id !== undefined);
            setUserReservationProductIds(productIds);

            // Update the global orders count in the store to reflect on the profile page
            store.setOrdersCount(res.data.metadata?.total_count || 0);
          })
          .catch((err) => {
            console.error("Failed to refresh reservation list:", err);
          });
      }
    } catch (e) {
      console.log(e);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="error">
            <ToastTitle>Failed to reserve products.</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  // Track product IDs to be removed from confirmation
  const [uncheckedProducts, setUncheckedProducts] = useState<number[]>([]);

  const handleCheckboxToggle = (productId: number, checked: boolean) => {
    if (!checked) {
      // Add to unchecked list when unchecked
      setUncheckedProducts((prev) => [...prev, productId]);
    } else {
      // Remove from unchecked list when checked
      setUncheckedProducts((prev) => prev.filter((id) => id !== productId));
    }
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

  // Perform search with debounce
  const performSearch = useCallback(
    debounce(async (query: string) => {
      console.log("Performing search for:", query);
      if (!query.trim()) {
        // If search is cleared, reload products by release
        loadProductsByRelease(selectedReleaseId);
        return;
      }

      setIsSearching(true);
      try {
        const options: SearchOptions = {};
        if (selectedReleaseId) {
          options.release_id = selectedReleaseId;
        }

        const response = await searchReservationProducts(query, options);

        // Map the search response to products format with unique IDs for list rendering
        const searchProducts = response.data.reservations.map((item: any) => {
          const baseUrl = Constants.expoConfig?.extra?.apiUrl || "";
          const coverUrl =
            item.product.cover_url ||
            `${baseUrl}/products/${item.product.id}/cover?v=${new Date(
              item.product.cover_updated_at
            ).getTime()}`;

          return {
            ...item.product,
            meta_attributes: {
              ...item.product.meta_attributes,
              reserved: item.reserved,
            },
            quantity: item.quantity,
            formatted_price: item.price,
            // Add cover URL for images
            cover_url: coverUrl,
            // Use this for unique list keys
            _uniqueKey: `${item.product.id}-${item.id}`,
          };
        });

        setProducts(searchProducts);
      } catch (err) {
        console.error("Search failed:", err);
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={"toast-" + id} action="error">
              <ToastTitle>Search failed. Please try again.</ToastTitle>
            </Toast>
          ),
        });
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [selectedReleaseId]
  );

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    console.log("Search input changed:", text);
    setSearchQuery(text);
    // Don't call performSearch here if text is empty to prevent loops
    if (text.trim()) {
      performSearch(text);
    } else if (text === "") {
      console.log("Search cleared, reloading products");
      loadProductsByRelease(selectedReleaseId);
    }
  };

  // Clear search and reset to release products
  const clearSearch = () => {
    console.log("Clear search called");
    setSearchQuery("");
    setShowSearchBar(false);

    if (products.length === 0 || searchQuery.trim() !== "") {
      console.log("Reloading products after clear search");
      loadProductsByRelease(selectedReleaseId);
    }
  };

  return (
    <DashboardLayout>
      <>
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
            {showSearchBar ? (
              <View className="flex-row items-center mb-4">
                <View className="flex-1 flex-row items-center border border-gray-300 rounded-lg px-2 py-1">
                  <Search size={18} color="#666" />
                  <TextInput
                    className="flex-1 ml-2 py-1"
                    placeholder="Search comics..."
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    onSubmitEditing={() => {
                      console.log("Search submitted:", searchQuery);
                      if (searchQuery.trim()) {
                        performSearch.cancel();
                        performSearch(searchQuery);
                      }
                    }}
                    returnKeyType="search"
                    autoFocus
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={clearSearch}>
                      <X size={18} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  className="ml-2 p-2"
                  onPress={() => setShowSearchBar(false)}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-bold text-lg">
                  {formatDateHuman(selectedDate)}
                </Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    className="mr-4"
                    onPress={() => setShowSearchBar(true)}
                  >
                    <Search size={24} color="#333" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      // Prevent multi-select mode for old releases
                      if (isOldRelease() && !isMultiSelectMode) {
                        toast.show({
                          placement: "top",
                          render: ({ id }) => (
                            <Toast nativeID={"toast-" + id} action="warning">
                              <ToastTitle>
                                Cannot reserve from past releases
                              </ToastTitle>
                            </Toast>
                          ),
                        });
                        return;
                      }

                      if (isMultiSelectMode) {
                        setIsMultiSelectMode(false);
                        setSelectedProducts([]);
                      } else {
                        setIsMultiSelectMode(true);
                      }
                    }}
                  >
                    {isMultiSelectMode ? (
                      <Text className="mr-4">Cancel</Text>
                    ) : (
                      <ClipboardCheck
                        size={24}
                        color={isOldRelease() ? "#9E9E9E" : "#333"}
                        className="mr-4"
                      />
                    )}
                  </TouchableOpacity>
                  {selectedProducts.length > 0 && (
                    <Pressable onPress={showConfirmationDialog}>
                      <Text className="font-bold">
                        Confirm ({selectedProducts.length})
                      </Text>
                    </Pressable>
                  )}
                  <TouchableOpacity onPress={toggleDrawer} className="p-2">
                    <Menu size={24} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
                  <View className="bg-amber-50 rounded-md p-2.5 mb-2.5 border border-amber-200">
                    <Text className="text-amber-800">
                      This is a past release. To browse the current release,{" "}
                      <Text
                        className="font-bold text-indigo-900"
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

            {isSearching && (
              <View className="items-center py-2">
                <ActivityIndicator size="small" color="#1A237E" />
              </View>
            )}

            {searchQuery.length > 0 &&
              !isSearching &&
              products.length === 0 && (
                <View className="items-center py-4">
                  <Text>No products found matching "{searchQuery}"</Text>
                </View>
              )}
          </View>
          <MasonryList
            data={products}
            scrollEnabled
            loading={loading && !isSearching}
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
                      {searchQuery.length > 0
                        ? `No results found for "${searchQuery}"`
                        : "The reservation list is already closed or was not found."}
                    </Text>
                    {searchQuery.length === 0 && (
                      <Text>
                        Please come back on Friday for the new releases!
                      </Text>
                    )}
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
                  {isSearching
                    ? `Searching for "${searchQuery}"...`
                    : "Hang tight, we're loading the latest releases!"}
                </Text>
              </>
            }
            numColumns={2}
            keyExtractor={(item: any) => {
              // Use _uniqueKey from search results if available, otherwise use product id
              return item._uniqueKey || item.id.toString();
            }}
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
                          // Prevent selecting already reserved products in the current view
                          // or products that are already in the user's reservation list
                          if (isOldRelease()) {
                            toast.show({
                              placement: "top",
                              render: ({ id }) => (
                                <Toast
                                  nativeID={"toast-" + id}
                                  action="warning"
                                >
                                  <ToastTitle>
                                    Cannot reserve from past releases
                                  </ToastTitle>
                                </Toast>
                              ),
                            });
                          } else if (
                            !reservedProductIds.includes(product.id) &&
                            !userReservationProductIds.includes(product.id)
                          ) {
                            toggleProductSelection(product.id);
                          } else if (
                            userReservationProductIds.includes(product.id)
                          ) {
                            toast.show({
                              placement: "top",
                              render: ({ id }) => (
                                <Toast
                                  nativeID={"toast-" + id}
                                  action="warning"
                                >
                                  <ToastTitle>
                                    Already in your reservation list
                                  </ToastTitle>
                                </Toast>
                              ),
                            });
                          }
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
                        // Reduce opacity for products that can't be selected (already reserved in UI or in user's list or old release)
                        isMultiSelectMode &&
                        (reservedProductIds.includes(product.id) ||
                          userReservationProductIds.includes(product.id) ||
                          isOldRelease())
                          ? { opacity: 0.4 }
                          : {},
                        // Show different visual styling for products already in user's reservation list
                        isMultiSelectMode &&
                        userReservationProductIds.includes(product.id)
                          ? {
                              borderWidth: 1,
                              borderColor: "#FF9800",
                              borderRadius: 12,
                              backgroundColor: "rgba(255, 152, 0, 0.1)",
                            }
                          : {},
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
                        <View
                          style={{ padding: 4, margin: 8, marginBottom: 0 }}
                        >
                          {product.cover_url && !imageErrors[product.id] ? (
                            // Show actual image if URL exists and no error
                            <Image
                              source={{
                                uri:
                                  product.cover_url ??
                                  `https://assets.comic-odyssey.com/products/covers/small/${product.cover_file_name}`,
                              }}
                              alt={product.id.toString()}
                              className="h-48 w-full rounded-md"
                              resizeMode="cover"
                              onError={() => {
                                console.log(
                                  `Failed to load image for product: ${product.id}`
                                );
                                setImageErrors((prev) => ({
                                  ...prev,
                                  [product.id]: true,
                                }));
                              }}
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
                          ) : (
                            // Show placeholder when URL is missing or there was an error
                            <View className="h-48 w-full rounded-md bg-gray-200 flex items-center justify-center">
                              <Image
                                source={ComicOdysseyIcon}
                                alt="Placeholder"
                                className="w-32 h-32 opacity-70"
                                resizeMode="contain"
                              />
                            </View>
                          )}
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
                              {userReservationProductIds.includes(
                                product.id
                              ) && (
                                <Text className="text-orange-500 font-bold text-xs">
                                  Already Reserved
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>
                      </Box>
                    </Pressable>
                  </View>
                  <TouchableOpacity
                    className={`px-3 ${
                      isWanted ? "opacity-50" : "opacity-100"
                    }`}
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
                    <Text className="text-indigo-900 font-bold">
                      {isWanted ? "Wanted!" : "I want this"}
                    </Text>
                  </TouchableOpacity>
                </>
              );
            }}
          />
          <Box className="h-40" />
        </Box>

        {/* Confirmation Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showConfirmationModal}
          onRequestClose={() => setShowConfirmationModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="w-[90%] max-h-[80%] bg-white rounded-xl p-5 shadow-lg">
              <Text className="text-lg font-bold mb-2.5">
                Please Confirm the products you want to request for this
                release.
              </Text>

              <ScrollView className="max-h-[400px]">
                {confirmationProducts.map((product) => (
                  <View
                    key={product.id}
                    className="flex-row items-center p-2.5 border-b border-gray-200"
                  >
                    <Checkbox
                      value={product.id.toString()}
                      isChecked={!uncheckedProducts.includes(product.id)}
                      onChange={(isSelected) =>
                        handleCheckboxToggle(product.id, isSelected)
                      }
                      size="md"
                      aria-label={`Select ${product.title}`}
                    >
                      <CheckboxIndicator>
                        <CheckboxIcon as={Check} />
                      </CheckboxIndicator>
                    </Checkbox>

                    <View className="mx-2.5 flex-1 flex-row items-center">
                      {product.cover_url ? (
                        <Image
                          source={{ uri: product.cover_url }}
                          alt={product.title}
                          className="w-10 h-[60px] mr-2.5"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-10 h-[60px] bg-gray-100 mr-2.5" />
                      )}

                      <View className="flex-1 ml-3">
                        <Text numberOfLines={1} className="font-bold">
                          {product.title}
                        </Text>
                        <Text className="text-teal-600">
                          {product.formatted_price}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View className="flex-row justify-between mt-5">
                <TouchableOpacity
                  onPress={() => setShowConfirmationModal(false)}
                  className="py-2.5 px-5 border border-indigo-900 rounded"
                >
                  <Text className="text-indigo-900">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmReservation}
                  className="py-2.5 px-5 bg-indigo-900 rounded"
                  disabled={confirmationProducts.length === 0}
                >
                  <Text className="text-white font-bold">
                    Confirm ({confirmationProducts.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    </DashboardLayout>
  );
}
