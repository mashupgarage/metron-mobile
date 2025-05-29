import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, FlatList, ScrollView } from "react-native";
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

import { ActivityIndicator, View } from "react-native";

const CollectionScreen = () => {
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
    setSeriesCount(store.user?.series_ids?.length || 0);
    // fetch collected series
    getUserCollection()
      .then((res) => {
        setLoading(false);
        console.log("user", res.data);
        setCollectedSeries(res.data.series_stats || []);
        setSeries(res.data.series || []);
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
        backgroundColor: colorScheme === "dark" ? "#121212" : "#fff",
      }}
    >
      {/* Header */}
      <NavigationHeader />
      <Box className="flex-row items-center justify-between px-4 mt-8 mb-4">
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            fontFamily: "Inter",
            color: colorScheme === "dark" ? "#FFFFFF" : "#181718",
          }}
        >
          Your Collection
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
        data={loading ? Array.from({ length: 6 }) : series}
        numColumns={2}
        keyExtractor={(item, idx) =>
          loading ? idx.toString() : item.series.id.toString()
        }
        contentContainerStyle={{ paddingTop: 16 }}
        renderItem={({ item, index }) =>
          loading ? (
            <Box key={index} className="flex-1 ml-2 mr-2 mb-4 max-w-[45%]">
              <SeriesCardSkeleton />
            </Box>
          ) : (
            <Box
              key={item.series.id}
              className="flex-1 ml-2 mr-2 mb-4 max-w-[50%]"
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
                fontWeight: "bold",
                fontFamily: "Inter",
                color: colorScheme === "dark" ? "#FFFFFF" : "#181718",
              }}
              className="mt-4 mb-2 ml-4"
            >
              Top Series Collection
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingLeft: 0, marginBottom: 16 }}
            >
              {loading ? (
                <Box className="ml-[-8px] flex-row">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <SeriesCardSkeleton key={idx} horizontal />
                  ))}
                </Box>
              ) : collectedSeries.length === 0 ? (
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
                collectedSeries.map((s) => (
                  <Pressable
                    key={s.series.id}
                    className="ml-[-12px]"
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
                fontFamily: "Inter",
                color: colorScheme === "dark" ? "#FFFFFF" : "#181718",
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
