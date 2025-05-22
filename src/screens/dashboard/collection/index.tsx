import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { Box } from "@/src/components/ui/box";
import ProductCard from "@/src/components/product";
import { getUserCollection } from "@/src/api/apiEndpoints";
import { useBoundStore } from "@/src/store";

const categories = ["All", "Comics", "Novels"];

// Map category names to IDs (based on usage in comics.tsx and novels.tsx)
const CATEGORY_ID_MAP: Record<string, number | null> = {
  All: null,
  Comics: 6,
  Novels: 2,
};

const CollectionScreen = () => {
  const store = useBoundStore();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const [orderedProducts, setOrderedProducts] = useState<any[]>([]);
  const [wantlistedProducts, setWantlistedProducts] = useState<any[]>([]);
  const [seriesCount, setSeriesCount] = useState(0);
  const [collectedSeries, setCollectedSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch collection from API
  useEffect(() => {
    setLoading(true);
    getUserCollection(store.user.id ?? 0)
      .then((res) => {
        console.log("collected_series", res.data.collected_series);

        setOrderedProducts(res.data.ordered_products || []);
        setWantlistedProducts(res.data.wantlisted_products || []);
        setSeriesCount(res.data.series_count || 0);
        setCollectedSeries(res.data.collected_series || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load collection");
        setLoading(false);
      });
  }, []);

  const stats = [
    {
      label: "Series ",
      value: seriesCount,
      icon: "layers",
      color: "#0284c7",
    },
    {
      label: "Collected",
      value: orderedProducts.length,
      icon: "book",
      color: "#0284c7",
    },
  ];

  // Filtering logic for orderedProducts
  let filteredItems =
    selectedCategory === "All"
      ? orderedProducts
      : orderedProducts.filter(
          (item) => item.category_id === CATEGORY_ID_MAP[selectedCategory]
        );

  // Further filter by selected series if any
  if (selectedSeriesId !== null) {
    filteredItems = filteredItems.filter(
      (item) => item.series_id === selectedSeriesId
    );
  }

  // Filtering logic for collectedSeries
  const filteredSeries =
    selectedCategory === "All"
      ? collectedSeries
      : collectedSeries.filter(
          (series) => series.category_id === CATEGORY_ID_MAP[selectedCategory]
        );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <Box className="flex-row items-center justify-between px-4 pt-4">
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Collection</Text>
        <Box className="flex-row"></Box>
      </Box>

      {/* Stats Cards */}
      <Box className="flex-row justify-between px-4 mt-5">
        {stats.map((s, i) => (
          <Box
            key={s.label}
            className="items-center flex-1 mx-1"
            style={{
              backgroundColor: s.color + "22",
              borderRadius: 16,
              padding: 16,
            }}
          >
            {/* <Icon as={s.icon} size="md" color={s.color} /> */}
            <Text style={{ fontWeight: "bold", fontSize: 20, marginTop: 8 }}>
              {s.value}
            </Text>
            <Text style={{ color: s.color, marginTop: 2 }}>{s.label}</Text>
          </Box>
        ))}
      </Box>

      {/* Category Pills */}
      <Box className="flex-row px-4 mt-5 mb-4">
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={{
              backgroundColor: selectedCategory === cat ? "#8667F2" : "#F1F1F1",
              paddingHorizontal: 18,
              paddingVertical: 7,
              borderRadius: 20,
              marginRight: 10,
            }}
          >
            <Text
              style={{
                color: selectedCategory === cat ? "#fff" : "#222",
                fontWeight: "bold",
              }}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </Box>

      {/* Collection Grid */}
      <FlatList
        data={filteredItems}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 4, paddingTop: 16 }}
        renderItem={({ item }) => (
          <Box className="flex-1 mx-4 mb-4 max-w-[45%]">
            <ProductCard product={item as any} />
          </Box>
        )}
        ListHeaderComponent={
          <>
            {/* Most Collected Series */}
            <Text className="text-2xl font-bold mt-4 mb-2 ml-4">
              Collected Series
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingLeft: 8, marginBottom: 16 }}
            >
              {collectedSeries.length === 0 ? (
                <Box className="ml-2 flex-1 h-20 items-center justify-center">
                  <Text className="text-gray-500 italic">
                    No collected series yet.
                  </Text>
                </Box>
              ) : (
                collectedSeries.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() =>
                      setSelectedSeriesId(
                        selectedSeriesId === s.id ? null : s.id
                      )
                    }
                    style={{
                      marginLeft: 8,
                      backgroundColor:
                        selectedSeriesId === s.id ? "#0284c7" : "#38bdf8",
                      padding: 16,
                      borderRadius: 12,
                      minWidth: 80,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{ fontWeight: "bold", color: "#fff" }}
                    >
                      {s.title}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </>
        }
      />
    </SafeAreaView>
  );
};

export default CollectionScreen;
