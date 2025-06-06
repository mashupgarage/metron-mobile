import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, FlatList, ActivityIndicator } from "react-native";
import { Box } from "@/src/components/ui/box";
import { useBoundStore } from "@/src/store";
import SeriesCard from "@/src/components/series";
import NavigationHeader from "@/src/components/navigation-header";
import { useColorScheme } from "react-native";
import { getCollectionSeriesStatus } from "@/src/api/apiEndpoints";
import { useRoute } from "@react-navigation/native";
import { getWantList } from "@/src/api/apiEndpoints";
import { HStack } from "@/src/components/ui/hstack";

const DetailedCollectionScreen = () => {
  const [wantList, setWantList] = useState<number[]>([]);

  const store = useBoundStore();
  const route = useRoute();
  const colorScheme = useColorScheme();
  const [total_owned, setTotalOwned] = useState<number>(0);
  const [total_products, setTotalProducts] = useState<number>(0);
  const [collection, setCollection] = useState<any[]>([]);
  const [owned, setOwned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");

  // Fetch collection from API
  useEffect(() => {
    setLoading(true);
    // Fetch want list
    getWantList()
      .then((res) => {
        setWantList(res.data.want_lists.map((item: any) => item.id));
      })
      .catch(() => setWantList([]));

    // @ts-ignore
    const seriesId = route.params?.seriesId;
    if (!seriesId) {
      setLoading(false);
      return;
    }
    getCollectionSeriesStatus(seriesId)
      .then((res) => {
        setCollection(res.data.series.products);
        setOwned(res.data.series.products_owned);
        setTotalOwned(res.data.series.owned);
        setTotalProducts(res.data.series.total);
        setTitle(res.data.series.title);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setLoading(false));
  }, []);
  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colorScheme === "dark" ? "#121212" : "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#121212" : "#fff",
      }}
    >
      {/* Header */}
      <NavigationHeader />
      <HStack className="flex-row items-center justify-between px-4 mt-8 mb-4">
        <Text
          numberOfLines={3}
          ellipsizeMode="tail"
          style={{
            fontSize: 18,
            fontWeight: "bold",
            maxWidth: "60%",
            fontFamily: "Inter",
            color: colorScheme === "dark" ? "#FFFFFF" : "#181718",
          }}
        >
          {title || ""}
        </Text>

        <Text
          numberOfLines={2}
          style={{
            fontSize: 16,
            fontFamily: "Inter",
            color: colorScheme === "dark" ? "#FFFFFF" : "#181718",
          }}
        >
          {total_owned ?? 0} of {total_products ?? 0} Collected
        </Text>
      </HStack>
      <FlatList
        data={[...collection].sort((a, b) => a.title.localeCompare(b.title))}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingTop: 16 }}
        renderItem={({ item }) => {
          // grey out products you dont own yet.
          const grayed = !owned.includes(item.id);
          const transformed = {
            series_id: item.id,
            series: {
              id: item.id,
              title: item.title,
            },
            count: item.count,
            publisher: item.publisher,
            last_product: {
              id: item.id,
              title: item.title,
              image_url: item.image_url,
            },
            owned_products: item.owned_products,
            unowned_products: item.unowned_products,
            cover_url_large: item.cover_url_large,
            product_items_count: item.product_items_count,
            in_want_list: !wantList.includes(item.id),
            ...item,
          };

          return (
            <Box
              className="flex-1 mb-4"
              style={{
                height: 220,
                width: 135,
                marginBottom: 16,
              }}
            >
              <SeriesCard data={transformed} grayed={grayed} detailedDisplay />
            </Box>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default DetailedCollectionScreen;
