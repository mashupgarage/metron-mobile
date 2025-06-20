import React, { useState, useEffect, useMemo } from "react"
import { Text, ScrollView, TextInput, Dimensions } from "react-native"

import MasonryList from "@react-native-seoul/masonry-list"
import { Box } from "@/src/components/ui/box"
import { getUserCollection } from "@/src/api/apiEndpoints"
import { useBoundStore } from "@/src/store"
import SeriesCard from "@/src/components/series"
import SeriesCardSkeleton from "@/src/components/series/SeriesCardSkeleton"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Pressable } from "react-native"
import { DashboardStackParams } from "@/src/utils/types/navigation"
import { fonts } from "@/src/theme"
// @ts-ignore
import ComicOdysseyIcon from "@/src/assets/icon.png"

const CollectionScreen = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const deviceWidth = Dimensions.get("window").width
  const theme = useBoundStore((state) => state.theme)
  const store = useBoundStore()
  const navigation = useNavigation<NavigationProp<DashboardStackParams>>()

  // Defensive: Ensure arrays and fallback values
  const collection = Array.isArray(store.collection) ? store.collection : []
  const seriesRaw = Array.isArray(store.series) ? store.series : []
  const collectionCount = typeof store.collectionCount === 'number' ? store.collectionCount : collection.length

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Memoize sorted and filtered series
  const filteredSeries = useMemo(() => {
    try {
      return seriesRaw
        .filter(item =>
          item &&
          item.series &&
          typeof item.series.title === "string" &&
          item.series.title.toLowerCase().includes(debouncedQuery.trim().toLowerCase())
        )
        .sort((a, b) => b.series.title.localeCompare(a.series.title))
    } catch (e) {
      // Defensive: fallback to empty array if error
      console.error('Error filtering/sorting series:', e)
      return []
    }
  }, [seriesRaw, debouncedQuery])

  // Memoize collectedSeries for header section
  const collectedSeries = useMemo(() => {
    try {
      return collection
    } catch (e) {
      console.error('Error in collectedSeries:', e)
      return []
    }
  }, [collection])

  // Loading state: if store data isn't ready, show skeletons
  const loading = !Array.isArray(store.series) || store.series.length === 0

  // --- MasonryList is already virtualized, but for huge data sets, consider implementing pagination/infinite scroll here ---

  return (
    <>
      <Box className='flex-row items-center justify-between px-4 mb-4'>
        <Text style={[fonts.title, { color: theme.text }]}>Collections</Text>
        <Box className='flex-row'>
          <Text style={[fonts.body, { color: theme.text }]}>{collectionCount}</Text>
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
          loading ? idx.toString() : item.series?.id?.toString() || idx.toString()
        }
        style={{
          alignSelf: "flex-start",
          columnGap: 12,
          marginHorizontal: 12,
        }}
        renderItem={({ item, i }: { item: { series: any }; i: number }) =>
          loading ? (
            <Box key={i} className='items-center'>
              <SeriesCardSkeleton />
            </Box>
          ) : item && item.series ? (
            <Box key={i} className='items-center'>
              <Pressable
                onPress={() =>
                  navigation.navigate("DetailedCollectionScreen", {
                    seriesId: item.series.id,
                  })
                }
              >
                {/*
                  For best performance, ensure SeriesCard supports lazy loading/caching for images.
                  If you notice image-related memory issues, consider react-native-fast-image or similar.
                */}
                <SeriesCard data={item} />
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
                <Box className='flex-row'>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Box style={{ marginLeft: theme.spacing.md }} key={idx}>
                      <SeriesCardSkeleton horizontal />
                    </Box>
                  ))}
                </Box>
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
                collectedSeries.map((s) => (
                  s && s.series ? (
                    <Pressable
                      style={{
                        width: (deviceWidth / 3) * 0.9,
                        marginLeft: theme.spacing.sm,
                        marginRight: theme.spacing.xs,
                      }}
                      key={s.series.id}
                      onPress={() =>
                        navigation.navigate("DetailedCollectionScreen", {
                          seriesId: s.series.id,
                        })
                      }
                    >
                      <SeriesCard data={s} />
                    </Pressable>
                  ) : null
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
  );
};

export default CollectionScreen;
