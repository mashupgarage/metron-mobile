import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  FlatList,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import { Box } from "@/src/components/ui/box";
import { getUserCollection } from "@/src/api/apiEndpoints";
import { useBoundStore } from "@/src/store";
import SeriesCard from "@/src/components/series";
import SeriesCardSkeleton from "@/src/components/series/SeriesCardSkeleton";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Pressable } from "react-native";
import NavigationHeader from "@/src/components/navigation-header";
import { useColorScheme } from "react-native";
import { DashboardStackParams } from "@/src/utils/types/navigation";
import { Spinner } from "@gluestack-ui/themed";

const CollectionScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const deviceWidth = Dimensions.get("window").width;
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  const theme = useBoundStore((state) => state.theme);
  const store = useBoundStore();
  const colorScheme = useColorScheme();
  const [seriesCount, setSeriesCount] = useState(0);
  const [collectedSeries, setCollectedSeries] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<NavigationProp<DashboardStackParams>>();

  // Fetch collection from API
  useEffect(() => {
    setLoading(true);
    setSeriesCount(store.collectionCount);
    // fetch collected series
    getUserCollection()
      .then((res) => {
        setLoading(false);
        setCollectedSeries(res.data.series_stats || []);
        setSeries(
          res.data.series.sort((a: any, b: any) =>
            b.series.title.localeCompare(a.series.title)
          ) || []
        );
      })
      .catch((err) => {
        setLoading(false);
        console.log("Failed to load collection", err);
      });
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      {/* Header */}
      <NavigationHeader />
      <Box className="flex-row items-center justify-between px-4 mt-8 mb-4">
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            fontFamily: "Urbanist-Bold",
            color: theme.text,
          }}
        >
          Your Collection
        </Text>
        <Box className="flex-row">
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Urbanist-Bold",
              color: theme.text,
            }}
          >
            {seriesCount}
          </Text>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box
        style={{
          paddingHorizontal: theme.spacing.md,
          marginBottom: theme.spacing.md,
        }}
      >
        <Box style={{ position: "relative" }}>
          <TextInput
            placeholder="Search by title..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              backgroundColor: theme.background,
              borderRadius: 8,
              padding: 10,
              fontSize: 16,
              borderWidth: 1,
              borderColor: theme.border,
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
              accessibilityLabel="Clear search"
            >
              <Text style={{ fontSize: 18, color: "#888" }}>✕</Text>
            </Pressable>
          )}
        </Box>
      </Box>

      {/* Collection Grid */}
      <FlatList
        data={
          loading
            ? Array.from({ length: 6 })
            : [...series].filter(
                (item) =>
                  item &&
                  item.series &&
                  typeof item.series.title === "string" &&
                  item.series.title
                    .toLowerCase()
                    .includes(debouncedQuery.trim().toLowerCase())
              )
        }
        numColumns={deviceWidth > 325 ? 3 : 2}
        keyExtractor={(item, idx) =>
          loading ? idx.toString() : item.series.id.toString()
        }
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xs,
        }}
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
        renderItem={({ item, index }) =>
          loading ? (
            <Box key={index} className="items-center" style={{ width: 130 }}>
              <SeriesCardSkeleton />
            </Box>
          ) : (
            <Box
              key={item.series.id}
              className="items-center"
              style={{
                width: deviceWidth / 3,
                marginBottom: theme.spacing.md,
              }}
            >
              <Pressable
                onPress={() =>
                  navigation.navigate("DetailedCollectionScreen", {
                    seriesId: item.series.id,
                  })
                }
              >
                <SeriesCard data={item} />
              </Pressable>
            </Box>
          )
        }
        ListHeaderComponent={
          <>
            {/* Most Collected Series */}
            <Text
              style={{
                fontSize: 24,
                marginLeft: theme.spacing.xs,
                fontWeight: "bold",
                fontFamily: "Urbanist-Bold",
                color: theme.text,
              }}
              className=""
            >
              Top Series Collection
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingLeft: theme.spacing.md,
                paddingRight: theme.spacing.md,
                paddingTop: theme.spacing.md,
                paddingBottom: theme.spacing.md,
              }}
              style={{ marginBottom: theme.spacing.md }}
            >
              {loading ? (
                <Box className="flex-row" style={{ paddingHorizontal: 12 }}>
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Box key={idx} style={{ marginRight: 24 }}>
                      <SeriesCardSkeleton horizontal />
                    </Box>
                  ))}
                </Box>
              ) : collectedSeries.length === 0 ? (
                <Box className="ml-2 mr-2 flex-1 h-20 items-center justify-center">
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Urbanist-Bold",
                      color: theme.text,
                    }}
                  >
                    No collected series yet.
                  </Text>
                </Box>
              ) : (
                collectedSeries.map((s) => (
                  <Pressable
                    key={s.series.id}
                    style={{ marginRight: theme.spacing.lg }}
                    onPress={() =>
                      navigation.navigate("DetailedCollectionScreen", {
                        seriesId: s.series.id,
                      })
                    }
                  >
                    <SeriesCard data={s} />
                  </Pressable>
                ))
              )}
            </ScrollView>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                fontFamily: "Urbanist-Bold",
                color: theme.text,
              }}
              className="ml-2 pb-4"
            >
              Series Collection
            </Text>
          </>
        }
      />
    </SafeAreaView>
  );
};

export default CollectionScreen;
