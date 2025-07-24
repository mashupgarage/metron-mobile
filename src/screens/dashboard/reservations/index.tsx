import { Box } from "@/src/components/ui/box"
import { Image } from "@/src/components/ui/image"
import { Text } from "@/src/components/ui/text"
import {
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native"
import MasonryList from "@react-native-seoul/masonry-list"
// @ts-expect-error ts(6133)
import ComicOdysseyIcon from "@/src/assets/icon.png"
import React, { useEffect } from "react"
import { ProductT } from "@/src/utils/types/common"
import {
  ClipboardCheck,
  Menu,
  Search,
  Check,
  LayoutList,
  LayoutGrid,
} from "lucide-react-native"
import DashboardLayout from "../_layout"
import { useToast, Toast, ToastTitle } from "@/src/components/ui/toast"
import { getReservationList } from "@/src/api/apiEndpoints"
import ReleasesDrawer from "@/src/components/ReleasesDrawer"
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
} from "@/src/components/ui/checkbox"
import ProductCard from "@/src/components/rework/product-card"
import { useNavigation } from "@react-navigation/native"
import { Pressable } from "react-native"
import { useBoundStore } from "@/src/store"
import { useReservationManager } from "./useReservationManager"
import { StatusBar } from "expo-status-bar"
import { fonts } from "@/src/theme"
import { useViewMode } from "./useViewMode"
import ReservationsListView from "./ReservationsListView"

export default function ReservationsScreen() {
  const store = useBoundStore()
  const { theme, isDark } = store
  const toast = useToast()
  const deviceWidth = Dimensions.get("window").width

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
    showConfirmationModal,
    confirmationProducts,
    uncheckedProducts,

    // State Setters
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
  } = useReservationManager()

  const navigation = useNavigation()
  // Products already reserved in the current view
  // Products from the user's reservation list (across all releases)

  const incrementWantlistCount = useBoundStore(
    (state) => state.incrementWantlistCount
  )

  // List/grid view mode state
  const { viewMode, toggleViewMode } = useViewMode()

  // All reservation fetching and state logic is now handled in useReservationManager
  // No need to duplicate API calls or state management here.

  // useEffect for initialization is no longer needed; all fetching is handled in useReservationManager

  useEffect(() => {
    if (releaseDates.length > 0) {
      const latest = getLatestRelease(releaseDates)
      if (latest) {
        handleSelectDate(latest.id, latest.release_date)
      }
    }
  }, [releaseDates])

  return (
    <DashboardLayout>
      <Box className='h-screen w-full'>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Box className='h-screen w-full'>
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
          <View className='ml-4 mr-4'>
            {showSearchBar ? (
              <View className='flex-row items-center mt-4 mb-4'>
                <View style={{ position: "relative", width: "80%" }}>
                  <TextInput
                    style={{
                      backgroundColor: theme.surface,
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: theme.border,
                      color: theme.text,
                      paddingRight: 36,
                    }}
                    placeholder='Search releases...'
                    value={searchQuery}
                    placeholderTextColor={theme.text}
                    onChangeText={handleSearchChange}
                    onSubmitEditing={() => {
                      console.log("Search submitted:", searchQuery)
                      if (searchQuery.trim()) {
                        performSearch(searchQuery)
                      }
                    }}
                    returnKeyType='search'
                    autoFocus
                  />
                </View>
                <TouchableOpacity
                  className='ml-2 p-2'
                  onPress={() => {
                    setShowSearchBar(false)
                    clearSearch()
                  }}
                >
                  <Text style={[fonts.body, { color: theme.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className='flex-row justify-between items-center mb-4 mt-4'>
                <Text style={[fonts.title, { color: theme.text }]}>
                  Releases
                </Text>
                <View className='flex-row items-center'>
                  <TouchableOpacity
                    className='mr-4'
                    onPress={() => setShowSearchBar(true)}
                  >
                    <Search size={24} color={theme.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className='mr-2'
                    onPress={() => {
                      // Prevent multi-select mode for old releases
                      if (isOldRelease() && !isMultiSelectMode) {
                        toast.show({
                          placement: "top",
                          render: ({ id }) => (
                            <Toast nativeID={"toast-" + id} action='warning'>
                              <ToastTitle>
                                Cannot reserve from past releases
                              </ToastTitle>
                            </Toast>
                          ),
                        })
                        return
                      }
                      toggleMultiSelectMode()
                    }}
                  >
                    <ClipboardCheck
                      size={24}
                      color={isOldRelease() ? theme.gray[500] : theme.text}
                      className='mr-4 ml-4'
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={toggleDrawer} className='p-2'>
                    <Menu size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {/* Action Strip Bar for Multi-Select Mode */}
            {isMultiSelectMode && (
              <View
                style={{
                  backgroundColor: theme.card,
                  zIndex: 10,
                }}
                className='w-full flex-row justify-between items-center py-3 mb-2 rounded-b-lg'
              >
                <TouchableOpacity
                  onPress={toggleMultiSelectMode}
                  className='py-2.5 px-5 rounded'
                  style={{ borderWidth: 1, borderColor: theme.border }}
                >
                  <Text style={[fonts.label, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={showConfirmationDialog}
                  className='py-2.5 px-5 rounded'
                  style={{ backgroundColor: selectedProducts.length > 0 ? theme.primary[500] : theme.gray[300] }}
                  disabled={selectedProducts.length === 0}
                >
                  <Text style={[fonts.label, { color: selectedProducts.length > 0 ? theme.white : theme.text }]}>Confirm ({selectedProducts.length})</Text>
                </TouchableOpacity>
              </View>
            )}
            <Box className='flex-row justify-between items-center'>
              <Text
                style={[
                  {
                    color: theme.text,
                    fontWeight: "bold",
                    fontSize: 14,
                    maxWidth: "90%",
                  },
                ]}
                className='mb-4'
              >
                {(() => {
                  const selectedRelease = releaseDates.find(
                    (item) => item.id === selectedReleaseId
                  )
                  return selectedRelease ? selectedRelease.title : ""
                })()}
              </Text>
              <TouchableOpacity className='mr-2' onPress={toggleViewMode}>
                <Text style={[fonts.body, { color: theme.text }]}>
                  {viewMode !== "grid" ? (
                    <LayoutList size={24} color={theme.text} />
                  ) : (
                    <LayoutGrid size={24} color={theme.text} />
                  )}
                </Text>
              </TouchableOpacity>
            </Box>
            {/* Highlighted message for past releases */}
            {(() => {
              const latest = getLatestRelease(releaseDates)
              if (
                latest &&
                selectedReleaseId &&
                selectedReleaseId !== latest.id
              ) {
                return (
                  <View className='bg-amber-50 rounded-md p-2.5 mb-2.5 border border-amber-200'>
                    <Text style={[fonts.caption, { color: theme.warning }]}>
                      This is a past release. To browse the current release,{" "}
                      <Text
                        style={[
                          fonts.caption,
                          { color: theme.warning, fontWeight: "bold" },
                        ]}
                        onPress={() => {
                          const latest = getLatestRelease(releaseDates)
                          if (latest) {
                            handleSelectDate(latest.id, latest.release_date)
                          }
                        }}
                      >
                        press here.
                      </Text>
                    </Text>
                  </View>
                )
              } else if (latest && latest.status === "close") {
                return (
                  <View className='bg-amber-50 rounded-md p-2.5 mb-2.5 border border-amber-200'>
                    <Text
                      style={[
                        fonts.caption,
                        {
                          fontWeight: "bold",
                          color: theme.warning,
                        },
                      ]}
                    >
                      This release is now closed.
                    </Text>
                  </View>
                )
              }
              return null
            })()}

            {isSearching && (
              <View className='items-center py-2'>
                <ActivityIndicator size='small' color={theme.primary[500]} />
              </View>
            )}

            {searchQuery.length > 0 &&
              !isSearching &&
              (!Array.isArray(products) || products.length === 0) && (
                <View className='items-center py-4'>
                  <Text style={[fonts.caption, { color: theme.text }]}>
                    No products found matching &rdquo;{searchQuery}&ldquo;
                  </Text>
                </View>
              )}
          </View>
          {viewMode === "list" ? (
            <ReservationsListView
              products={Array.isArray(products) ? products : []}
              onPressProduct={(product) => {
                getReservationList(store.user?.id).then((res) => {
                  const reservationList = res.data.reservations
                  // @ts-expect-error navigation.navigate is not typed
                  navigation.navigate("Product", {
                    product: product,
                    fromReservations: true,
                    reservationId: selectedReleaseId,
                    reservationList,
                  })
                })
              }}
              keyExtractor={(item, idx) => `${item.id}_${idx}`}
              loadMoreProducts={loadMoreProducts}
              isMultiSelectMode={isMultiSelectMode}
              selectedProducts={selectedProducts}
              reservedProductIds={userReservationProductIds}
              wantedProductIds={wantedProductIds}
              toggleProductSelection={toggleProductSelection}
              addToWantListHandler={addToWantListHandler}
            />
          ) : (
            <MasonryList
              data={(() => {
                // Add debugging to see what products actually is
                if (!Array.isArray(products)) {
                  console.log(
                    "Products is not an array in MasonryList:",
                    products
                  )
                  // If it's an object but not an array, try to convert it
                  if (products && typeof products === "object") {
                    // If it has values or entries properties (like an object map)
                    if ("values" in products) {
                      console.log(
                        "Attempting to convert products object to array"
                      )
                      return Object.values(products)
                    }
                  }
                  return []
                }
                return products
              })()}
              scrollEnabled
              loading={loading && !isSearching}
              onEndReached={loadMoreProducts}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={
                loading ? (
                  <View className='flex mt-56 mb-4 flex-col items-center' />
                ) : (
                  <View className='flex mt-56 mb-4 flex-col items-center'>
                    <View className='flex items-center'>
                      <Image
                        alt='Comic Odyssey Icon'
                        key='closed'
                        className='w-full max-h-16 scale-[0.8]'
                        resizeMethod='scale'
                        source={ComicOdysseyIcon}
                      />
                      <Text
                        style={[fonts.caption, { color: theme.text }]}
                        className='mt-4 mb-2'
                      >
                        {searchQuery.length > 0
                          ? `No results found for "${searchQuery}"`
                          : "The reservation list is already closed or was not found."}
                      </Text>
                      {searchQuery.length === 0 && (
                        <Text style={[fonts.caption, { color: theme.text }]}>
                          Please come back on Friday for the new releases!
                        </Text>
                      )}
                    </View>
                  </View>
                )
              }
              ListFooterComponent={
                <Box className='py-4 flex justify-center items-center'>
                  {(loading || isFetchingMore) && (
                    <View>
                      <ActivityIndicator
                        size='small'
                        color={theme.primary[500]}
                      />
                      <Text
                        className='mt-2'
                        style={[fonts.body, { color: theme.text }]}
                      >
                        Loading products...
                      </Text>
                    </View>
                  )}

                  {Array.isArray(products) && products.length > 0 && (
                    <Text
                      className='text-sm text-gray-500 mt-2'
                      style={[fonts.body, { color: theme.text }]}
                    >
                      Showing {products.length} of {totalCount} products
                    </Text>
                  )}
                </Box>
              }
              LoadingView={
                <View>
                  <Image
                    alt='Comic Odyssey Icon'
                    key='loading'
                    className='w-full max-h-16 scale-[0.8] align-center'
                    resizeMethod='scale'
                    source={ComicOdysseyIcon}
                  />
                  <Text
                    style={[fonts.body, { color: theme.text }]}
                    className='mt-4 text-center mb-2'
                  >
                    {isSearching
                      ? `Searching for "${searchQuery}"...`
                      : "Hang tight, we're loading the latest releases!"}
                  </Text>
                </View>
              }
              numColumns={deviceWidth > 325 ? 3 : 2}
              keyExtractor={(item) => {
                // Use _uniqueKey from search results if available, otherwise use product id
                return item._uniqueKey || `${item.id}_${Date.now()}`
              }}
              style={{
                columnGap: 12,
                marginHorizontal: theme.spacing.sm,
              }}
              renderItem={({ item }) => {
                const product = item as ProductT
                const isWanted = wantedProductIds.includes(product.id)
                const isSelected = selectedProducts.includes(product.id)
                return (
                  <>
                    <View>
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
                                    action='warning'
                                  >
                                    <ToastTitle>
                                      Cannot reserve from past releases
                                    </ToastTitle>
                                  </Toast>
                                ),
                              })
                            } else if (
                              !reservedProductIds.includes(product.id) &&
                              !userReservationProductIds.includes(product.id)
                            ) {
                              toggleProductSelection(product.id)
                            } else if (
                              userReservationProductIds.includes(product.id)
                            ) {
                              toast.show({
                                placement: "top",
                                render: ({ id }) => (
                                  <Toast
                                    nativeID={"toast-" + id}
                                    action='warning'
                                  >
                                    <ToastTitle>
                                      Already in your reservation list
                                    </ToastTitle>
                                  </Toast>
                                ),
                              })
                            }
                          } else {
                            getReservationList(store.user?.id).then((res) => {
                              const reservationList = res.data.reservations
                              // @ts-expect-error navigation.navigate is not typed
                              navigation.navigate("Product", {
                                product: product,
                                fromReservations: true,
                                reservationId: selectedReleaseId,
                                reservationList,
                              })
                            })
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
                                borderRadius: 8,
                              }
                            : {},
                        ]}
                      >
                        <ProductCard
                          product={product}
                          grid
                          reservationStatus={userReservationProductIds.includes(
                            product.id
                          ) ? "Reserved" : ""}
                          isSelected={isMultiSelectMode && isSelected}
                          isWanted={isWanted}
                          showWantListButton
                          onWantListPress={async () => {
                            try {
                              await addToWantListHandler(product.id)
                              incrementWantlistCount()
                              alert("Added to your want list!")
                            } catch (e) {
                              console.log(e)
                              alert("Failed to add to want list.")
                            }
                          }}
                          showAlreadyReservedText
                          reservedOverlayBottom={40}
                        />
                      </Pressable>
                    </View>
                  </>
                )
              }}
            />
          )}
          {/* Confirmation Modal */}
          <Modal
            animationType='slide'
            transparent={true}
            visible={showConfirmationModal}
            onRequestClose={() => setShowConfirmationModal(false)}
          >
            <View className='flex-1 justify-center items-center bg-black/50'>
              <View
                style={{
                  backgroundColor: theme.background,
                }}
                className='w-[90%] max-h-[80%] rounded-xl p-5 shadow-lg'
              >
                <Text style={[fonts.body, { color: theme.text }]}>
                  Please Confirm the products you want to request for this
                  release.
                </Text>

                <ScrollView className='max-h-[400px]'>
                  {confirmationProducts.map((product) => (
                    <View
                      key={product.id}
                      className='flex-row items-center p-2.5 border-b border-gray-200'
                    >
                      <Checkbox
                        value={product.id.toString()}
                        isChecked={!uncheckedProducts.includes(product.id)}
                        onChange={(isSelected) =>
                          handleCheckboxToggle(product.id, isSelected)
                        }
                        size='md'
                        aria-label={`Select ${product.title}`}
                      >
                        <CheckboxIndicator>
                          <CheckboxIcon as={Check} />
                        </CheckboxIndicator>
                      </Checkbox>

                      <View className='mx-2.5 flex-1 flex-row items-center'>
                        {product.cover_url ? (
                          <Image
                            source={{ uri: product.cover_url }}
                            alt={product.title}
                            className='w-16 h-[60px] mr-2.5'
                            resizeMode='contain'
                          />
                        ) : (
                          <View className='w-10 h-[60px] bg-gray-100 mr-2.5' />
                        )}

                        <View className='flex-1 ml-3'>
                          <Text
                            numberOfLines={2}
                            style={[
                              fonts.caption,
                              { color: theme.text, fontWeight: "bold" },
                            ]}
                          >
                            {product.title}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={[
                              fonts.caption,
                              { color: theme.text, marginTop: 4 },
                            ]}
                          >
                            {product.creators}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <View className='flex-row justify-between mt-5'>
                  <TouchableOpacity
                    onPress={() => setShowConfirmationModal(false)}
                    className='py-2.5 px-5 rounded'
                    style={{
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <Text style={[fonts.label, { color: theme.text }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={confirmReservation}
                    className='py-2.5 px-5 rounded'
                    style={{
                      backgroundColor: theme.primary[500],
                    }}
                    disabled={confirmationProducts.length === 0}
                  >
                    <Text style={[fonts.label, { color: theme.white }]}>
                      Confirm ({confirmationProducts.length})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </Box>
      </Box>
    </DashboardLayout>
  )
}
