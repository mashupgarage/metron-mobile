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
  useColorScheme,
} from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
// @ts-ignore
import ComicOdysseyIcon from "@/src/assets/icon.png";
import React, { useEffect } from "react";
import { useWantListStore } from "@/src/store/slices/WantListSlice";
import { ProductT } from "@/src/utils/types/common";
import { ClipboardCheck, Menu, Search, X, Check } from "lucide-react-native";
import DashboardLayout from "../_layout";
import { useToast, Toast, ToastTitle } from "@/src/components/ui/toast";
import { getReservationList } from "@/src/api/apiEndpoints";
import ReleasesDrawer from "@/src/components/ReleasesDrawer";
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
} from "@/src/components/ui/checkbox";

import { useNavigation } from "@react-navigation/native";
import { Pressable } from "react-native";
import { useBoundStore } from "@/src/store";
import { useReservationManager } from "./useReservationManager";

export default function ReservationsScreen() {
  const colorScheme = useColorScheme();
  const store = useBoundStore();
  const { theme } = store;
  const toast = useToast();

  const {
    // State
    wantedProductIds,
    releaseDates,
    products,
    reservedProductIds,
    userReservationProductIds,
    loading,
    selectedProducts,
    isMultiSelectMode,
    showDrawer,
    selectedReleaseId,
    searchQuery,
    isSearching,
    showSearchBar,
    imageErrors,
    showConfirmationModal,
    confirmationProducts,
    uncheckedProducts,

    // State Setters
    setImageErrors,
    setShowSearchBar,
    setShowConfirmationModal,

    // Helper Methods
    getLatestRelease,
    isOldRelease,

    // UI Methods
    toggleDrawer,
    handleSelectDate,
    clearFilters,

    // Reservation Methods
    toggleProductSelection,
    toggleMultiSelectMode,
    showConfirmationDialog,
    confirmReservation,
    handleCheckboxToggle,
    addToWantListHandler,

    // Search Methods
    handleSearchChange,
    clearSearch,
    performSearch,

    // Pagination
    loadMoreProducts,
    isFetchingMore,
    totalCount,
  } = useReservationManager();

  const navigation = useNavigation();
  // Products already reserved in the current view
  // Products from the user's reservation list (across all releases)

  const incrementWantlistCount = useWantListStore(
    (state) => state.incrementWantlistCount
  );

  // All reservation fetching and state logic is now handled in useReservationManager
  // No need to duplicate API calls or state management here.

  // useEffect for initialization is no longer needed; all fetching is handled in useReservationManager

  useEffect(() => {
    if (releaseDates.length > 0) {
      const latest = getLatestRelease(releaseDates);
      if (latest) {
        handleSelectDate(latest.id, latest.release_date);
      }
    }
  }, [releaseDates]);

  return (
    <DashboardLayout>
      <>
        <Box className="h-screen w-full">
          <ReleasesDrawer
            visible={showDrawer}
            releaseDates={(Array.isArray(releaseDates) ? releaseDates : [])
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
              <View className="flex-row items-center mt-4 mb-4">
                <View className="flex-1 flex-row items-center border border-gray-300 rounded-lg px-2 py-1">
                  <Search size={18} color={theme.text} />
                  <TextInput
                    className="flex-1 ml-2 py-1"
                    placeholder="Search comics..."
                    value={searchQuery}
                    style={{
                      color: theme.text,
                    }}
                    placeholderTextColor={theme.text}
                    onChangeText={handleSearchChange}
                    onSubmitEditing={() => {
                      console.log("Search submitted:", searchQuery);
                      if (searchQuery.trim()) {
                        performSearch(searchQuery);
                      }
                    }}
                    returnKeyType="search"
                    autoFocus
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={clearSearch}>
                      <X size={18} color={theme.text} />
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
              <View className="flex-row justify-between items-center mb-4 mt-4">
                <Text className="font-bold text-lg">
                  {/* {formatDateHuman(selectedDate)} */}
                </Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    className="mr-4"
                    onPress={() => setShowSearchBar(true)}
                  >
                    <Search size={24} color={theme.text} />
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
                        toggleMultiSelectMode();
                      } else {
                        toggleMultiSelectMode();
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
                    <Menu size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <Text
              style={{ fontFamily: "PublicSans-regular" }}
              className="mb-2 text-sm"
            >
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
                    <Text
                      style={{ fontFamily: "PublicSans-regular" }}
                      className="text-amber-800"
                    >
                      This is a past release. To browse the current release,{" "}
                      <Text
                        style={{ fontFamily: "PublicSans-regular" }}
                        className="text-indigo-900"
                        onPress={() => {
                          const latest = getLatestRelease(releaseDates);
                          if (latest) {
                            handleSelectDate(latest.id, latest.release_date);
                          }
                        }}
                      >
                        press here.
                      </Text>
                    </Text>
                  </View>
                );
              } else if (latest && latest.status === "close") {
                return (
                  <View className="bg-amber-50 rounded-md p-2.5 mb-2.5 border border-amber-200">
                    <Text
                      style={{ fontFamily: "PublicSans-regular" }}
                      className="text-amber-800"
                    >
                      This release is now closed.
                    </Text>
                  </View>
                );
              }
              return null;
            })()}

            {isSearching && (
              <View className="items-center py-2">
                <ActivityIndicator size="small" color={theme.primary[500]} />
              </View>
            )}

            {searchQuery.length > 0 &&
              !isSearching &&
              (!Array.isArray(products) || products.length === 0) && (
                <View className="items-center py-4">
                  <Text>No products found matching "{searchQuery}"</Text>
                </View>
              )}
          </View>
          <MasonryList
            data={(() => {
              // Add debugging to see what products actually is
              if (!Array.isArray(products)) {
                console.log(
                  "Products is not an array in MasonryList:",
                  products
                );
                // If it's an object but not an array, try to convert it
                if (products && typeof products === "object") {
                  // If it has values or entries properties (like an object map)
                  if ("values" in products) {
                    console.log(
                      "Attempting to convert products object to array"
                    );
                    return Object.values(products);
                  }
                }
                return [];
              }
              return products;
            })()}
            scrollEnabled
            loading={loading && !isSearching}
            onEndReached={loadMoreProducts}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              loading ? (
                <View className="flex mt-56 mb-4 flex-col items-center" />
              ) : (
                <View className="flex mt-56 mb-4 flex-col items-center">
                  <View className="flex items-center">
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
                  </View>
                </View>
              )
            }
            ListFooterComponent={
              <Box className="py-4 flex justify-center items-center">
                {(loading || isFetchingMore) && (
                  <View>
                    <ActivityIndicator
                      size="small"
                      color={theme.primary[500]}
                    />
                    <Text className="mt-2">Loading products...</Text>
                  </View>
                )}

                {Array.isArray(products) && products.length > 0 && (
                  <Text className="text-sm text-gray-500 mt-2">
                    Showing {products.length} of {totalCount} products
                  </Text>
                )}
              </Box>
            }
            LoadingView={
              <View>
                <Image
                  alt="Comic Odyssey Icon"
                  key="loading"
                  className="w-full max-h-16 scale-[0.8] align-center"
                  resizeMethod="scale"
                  source={ComicOdysseyIcon}
                />
                <Text
                  style={{ fontFamily: "PublicSans-regular" }}
                  className="mt-4 text-center mb-2"
                >
                  {isSearching
                    ? `Searching for "${searchQuery}"...`
                    : "Hang tight, we're loading the latest releases!"}
                </Text>
              </View>
            }
            numColumns={2}
            keyExtractor={(item: any) => {
              // Use _uniqueKey from search results if available, otherwise use product id
              return item._uniqueKey || `${item.id}_${Date.now()}`;
            }}
            contentContainerStyle={{
              padding: 12,
              paddingBottom: 0,
            }}
            renderItem={({ item, i }) => {
              const product = item as ProductT;
              const isWanted = wantedProductIds.includes(product.id);
              const isSelected = selectedProducts.includes(product.id);
              return (
                <>
                  <View
                    className="p-0"
                    style={
                      isMultiSelectMode && isSelected
                        ? {
                            borderWidth: 1,
                            borderColor: theme.primary[500],
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
                              borderColor: theme.primary[500],
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
                                  `https://assets.comic-odyssey.com/products/covers/small/${
                                    product.cover_url || ""
                                  }`,
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
                                      borderColor: theme.primary[500],
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
                            <Text
                              style={{ fontFamily: "Urbanist-Bold" }}
                              numberOfLines={1}
                              className="font-bold"
                            >
                              {product.title}
                            </Text>
                            <Text
                              style={{ fontFamily: "PublicSans-regular" }}
                              numberOfLines={1}
                              className="text-gray-600"
                            >
                              {product.creators}
                            </Text>
                          </View>
                          <View className="flex-row justify-between items-center mt-1">
                            <View style={{ alignItems: "flex-end" }}>
                              {userReservationProductIds.includes(
                                product.id
                              ) && (
                                <Text
                                  style={{ fontFamily: "PublicSans-regular" }}
                                  className="text-orange-500 font-bold text-xs"
                                >
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
                    className={`px-4 ${
                      isWanted ? "opacity-50" : "opacity-100"
                    }`}
                    disabled={isWanted}
                    onPress={async () => {
                      try {
                        await addToWantListHandler(product.id);
                        incrementWantlistCount();
                        alert("Added to your want list!");
                      } catch (e) {
                        console.log(e);
                        alert("Failed to add to want list.");
                      }
                    }}
                  >
                    <Text
                      style={{ fontFamily: "PublicSans-regular" }}
                      className="text-indigo-900 font-medium"
                    >
                      {isWanted ? "Wanted!" : "I want this"}
                    </Text>
                  </TouchableOpacity>
                </>
              );
            }}
          />
          <Box className="h-12" />
        </Box>

        {/* Confirmation Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showConfirmationModal}
          onRequestClose={() => setShowConfirmationModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View
              style={{
                backgroundColor: theme.background,
              }}
              className="w-[90%] max-h-[80%] rounded-xl p-5 shadow-lg"
            >
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
                  <Text
                    style={{
                      fontFamily: "PublicSans-regular",
                      color: theme.text,
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmReservation}
                  className="py-2.5 px-5 rounded"
                  style={{
                    backgroundColor: theme.primary[500],
                  }}
                  disabled={confirmationProducts.length === 0}
                >
                  <Text
                    style={{
                      fontFamily: "PublicSans-regular",
                      color: theme.text,
                    }}
                  >
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
