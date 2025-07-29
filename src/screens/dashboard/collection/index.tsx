import React, { useState, useEffect, useMemo } from "react"
import { Text, ScrollView, TextInput, Dimensions, View } from "react-native"

import MasonryList from "@react-native-seoul/masonry-list"
import { Box } from "@/src/components/ui/box"
import { useBoundStore } from "@/src/store"
import ProductCard from "@/src/components/rework/product-card"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Pressable } from "react-native"
import { DashboardStackParams } from "@/src/utils/types/navigation"
import { fonts } from "@/src/theme"
import { ProductT } from "@/src/utils/types/common"
import SeriesCardSkeleton from "@/src/components/series/SeriesCardSkeleton"

const CollectionScreen = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [minSkeletonElapsed, setMinSkeletonElapsed] = useState(false)
  const [dataReady, setDataReady] = useState(false)
  const deviceWidth = Dimensions.get("window").width
  const theme = useBoundStore((state) => state.theme)
  const store = useBoundStore()
  const navigation = useNavigation<NavigationProp<DashboardStackParams>>()

  // Defensive: Ensure arrays and fallback values
  const collection = useMemo(
    () => (Array.isArray(store.collection) ? store.collection : []),
    [store.collection]
  )
  const seriesRaw = useMemo(
    () => (Array.isArray(store.series) ? store.series : []),
    [store.series]
  )

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Transform series data to ProductT format for ProductCard
  const transformSeriesToProduct = (seriesItem: any): ProductT => {
    return {
      id: seriesItem.series?.id || 0,
      title: seriesItem.series?.title || "Unknown Series",
      cover_price: "0",
      price: "0",
      quantity: 1,
      featured: false,
      hidden: false,
      description: "",
      creators: seriesItem.publisher || "",
      series: seriesItem.series || { id: 0, title: "Unknown Series" },
      slug: `series-${seriesItem.series?.id}`,
      isbn: null,
      upc: "",
      publisher_id: 0,
      category_id: 0,
      series_id: seriesItem.series?.id || 0,
      issue_number: "",
      year: null,
      cover_url: seriesItem.last_product?.image_url || seriesItem.cover_url_large || "",
      cover_url_large: seriesItem.cover_url_large || "",
      formatted_price: "",
      publisher: seriesItem.publisher || "",
      publisher_name: seriesItem.publisher || "",
      category_name: "",
      meta_attributes: {
        owned_products: seriesItem.owned_products,
        unowned_products: seriesItem.unowned_products,
      },
    }
  }

  // Memoize sorted and filtered series
  const filteredSeries = useMemo(() => {
    try {
      return seriesRaw
        .filter(
          (item) =>
            item &&
            item.series &&
            typeof item.series.title === "string" &&
            item.series.title
              .toLowerCase()
              .includes(debouncedQuery.trim().toLowerCase())
        )
        .sort((a, b) => b.series.title.localeCompare(a.series.title))
        .map(transformSeriesToProduct)
    } catch (e) {
      // Defensive: fallback to empty array if error
      console.error("Error filtering/sorting series:", e)
      return []
    }
  }, [seriesRaw, debouncedQuery])

  // Memoize collectedSeries for header section
  const collectedSeries = useMemo(() => {
    try {
      return collection.map(transformSeriesToProduct)
    } catch (e) {
      console.error("Error in collectedSeries:", e)
      return []
    }
  }, [collection])

  // Show skeleton until BOTH: (a) 3s elapsed, (b) data is ready
  useEffect(() => {
    const timer = setTimeout(() => setMinSkeletonElapsed(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Consider data ready as soon as seriesRaw is an array (regardless of length)
    if (Array.isArray(seriesRaw)) {
      setDataReady(true)
    }
  }, [seriesRaw])

  const loading = !(minSkeletonElapsed && dataReady)

  // --- MasonryList is already virtualized, but for huge data sets, consider implementing pagination/infinite scroll here ---

  return (
    <>
      <Box className='flex-row items-center justify-between px-4 mb-4'>
        <Text style={[fonts.title, { color: theme.text }]}>Collections</Text>
        <Box className='flex-row'>
          <Text style={[fonts.body, { color: theme.text }]}>
            {seriesRaw.length}
          </Text>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box
        style={{
          paddingHorizontal: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
        }}
      >
        <Box style={{ position: "relative" }}>
          <TextInput
            placeholder='Search by title...'
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              backgroundColor: theme.background,
              borderRadius: 8,
              padding: 10,
              fontSize: 16,
              borderWidth: 1,
              borderColor: theme.border,
              color: theme.text,
              paddingRight: 36, // leave space for clear button
            }}
            placeholderTextColor={theme.text}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: 10,
                top: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: 28,
              }}
              accessibilityLabel='Clear search'
            >
              <Text style={[fonts.body, { color: theme.text }]}>✕</Text>
            </Pressable>
          )}
        </Box>
      </Box>

      {/* Collection Grid */}
      <MasonryList
        data={loading ? Array.from({ length: 6 }) : filteredSeries}
        scrollEnabled
        numColumns={deviceWidth > 325 ? 3 : 2}
        keyExtractor={(item, idx) =>
          loading
            ? idx.toString()
            : item.id?.toString() || idx.toString()
        }
        style={{
          alignSelf: "flex-start",
          columnGap: 12,
          marginHorizontal: 12,
        }}
        renderItem={({
          item,
          i,
        }: {
          item: ProductT
          i: number
        }) =>
          loading ? (
            <SeriesCardSkeleton grid />
          ) : item ? (
            <Box key={i} className='items-center'>
              <Pressable
                onPress={() =>
                  navigation.navigate("DetailedCollectionScreen", {
                    seriesId: item.series_id || item.id,
                  })
                }
              >
                <ProductCard product={item} hasPreview />
              </Pressable>
            </Box>
          ) : null
        }
        ListEmptyComponent={
          <Text
            style={[
              fonts.body,
              {
                color: theme.text,
                textAlign: "center",
                marginVertical: theme.spacing.xl,
              },
            ]}
          >
            No series found
          </Text>
        }
        contentContainerStyle={{}}
        ListHeaderComponent={
          <>
            {/* Most Collected Series */}
            <Text
              style={[
                fonts.title,
                {
                  marginTop: theme.spacing.lg,
                  color: theme.text,
                  marginLeft: theme.spacing.md,
                  marginBottom: theme.spacing.md,
                },
              ]}
            >
              Top Collected Series
            </Text>
            <ScrollView horizontal style={{ marginBottom: theme.spacing.md }}>
              {loading ? (
                <View style={{ marginHorizontal: theme.spacing.md, flexDirection: "row", gap: theme.spacing.lg }}>
                <SeriesCardSkeleton grid />
                <SeriesCardSkeleton grid />
                  <SeriesCardSkeleton grid />
                  <SeriesCardSkeleton grid />
                </View>
              ) : collectedSeries.length === 0 ? (
                <Text
                  style={[
                    fonts.body,
                    {
                      width: deviceWidth,
                      color: theme.text,
                      textAlign: "center",
                      marginVertical: theme.spacing.xl,
                    },
                  ]}
                >
                  No collected series yet.
                </Text>
              ) : (
                collectedSeries.map((product) => (
                  <Pressable
                    style={{
                      width: (deviceWidth / 3) * 0.9,
                      marginLeft: theme.spacing.sm,
                      marginRight: theme.spacing.xs,
                    }}
                    key={product.id}
                    onPress={() =>
                      navigation.navigate("DetailedCollectionScreen", {
                        seriesId: product.series_id || product.id,
                      })
                    }
                  >
                    <ProductCard product={product} hasPreview />
                  </Pressable>
                ))
              )}
            </ScrollView>
            <Text
              style={[
                fonts.title,
                {
                  color: theme.text,
                  marginLeft: theme.spacing.md,
                  marginBottom: theme.spacing.md,
                },
              ]}
            >
              Series Collection
            </Text>
          </>
        }
      />
    </>
  )
}

export default CollectionScreen
