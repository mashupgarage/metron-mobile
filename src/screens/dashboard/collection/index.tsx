import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, FlatList, ScrollView } from "react-native";
import { Box } from "@/src/components/ui/box";
import { getUserCollection } from "@/src/api/apiEndpoints";
import { useBoundStore } from "@/src/store";
import SeriesCard from "@/src/components/series";
import NavigationHeader from "@/src/components/navigation-header";
import { useColorScheme } from "react-native";

const CollectionScreen = () => {
  const store = useBoundStore();
  const colorScheme = useColorScheme();
  const [seriesCount, setSeriesCount] = useState(0);
  const [collectedSeries, setCollectedSeries] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch collection from API
  useEffect(() => {
    setLoading(true);
    setSeriesCount(store.user?.series_ids?.length || 0);
    setLoading(false);
    // fetch collected series
    getUserCollection()
      .then((res) => {
        console.log("user", res.data);
        setCollectedSeries(res.data.series_stats || []);
        setSeries(res.data.series || []);
      })
      .catch((err) => {
        console.log("Failed to load collection", err);
      });
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#121212" : "#fff",
      }}
    >
      {/* Header */}
      <NavigationHeader />
      <Box className="flex-row items-center justify-between px-4 mt-8 mb-4">
        <Text style={{ fontSize: 24, fontWeight: "bold", fontFamily: "Inter" }}>
          Collection
        </Text>
        <Box className="flex-row">
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter",
              color: colorScheme === "dark" ? "#FFFFFF" : "#181718",
            }}
          >
            {seriesCount}
          </Text>
        </Box>
      </Box>

      {/* Collection Grid */}
      <FlatList
        data={series}
        numColumns={2}
        // keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 4, paddingTop: 16 }}
        renderItem={({ item }) => (
          <Box className="flex-1 ml-2 mr-2 mb-4 max-w-[45%]">
            <SeriesCard data={item} />
          </Box>
        )}
        ListHeaderComponent={
          <>
            {/* Most Collected Series */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                fontFamily: "Inter",
              }}
              className="mt-4 mb-2 ml-4"
            >
              Top Series Collection
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingLeft: 8, marginBottom: 16 }}
            >
              {collectedSeries.length === 0 ? (
                <Box className="ml-2 flex-1 h-20 items-center justify-center">
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Inter",
                      color: colorScheme === "dark" ? "#FFFFFF" : "#181718",
                    }}
                  >
                    No collected series yet.
                  </Text>
                </Box>
              ) : (
                collectedSeries.map((s) => <SeriesCard data={s} />)
              )}
            </ScrollView>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                fontFamily: "Inter",
              }}
              className="mb-2 ml-4"
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
