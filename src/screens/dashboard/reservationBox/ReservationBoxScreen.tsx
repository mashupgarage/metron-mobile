import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  TextInput,
  Pressable,
  Dimensions,
} from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
import { LayoutGrid, LayoutList } from "lucide-react-native";
import { useColorScheme } from "react-native";
import { useBoundStore } from "@/src/store";
import { getReservationList } from "@/src/api/apiEndpoints";
import { ReservationItemT } from "@/src/utils/types/common";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import ReservationCard from "@/src/components/ReservationCard";
import NavigationHeader from "@/src/components/navigation-header";

const PAGE_SIZE = 50;

interface ExtendedReservationItemT extends Omit<ReservationItemT, "product"> {
  product?: {
    id: number;
    title: string;
    cover_price?: string;
    price?: string;
    formatted_price?: string;
    creators?: string;
    cover_file_name?: string;
    cover_content_type?: string;
    cover_file_size?: number;
    cover_updated_at?: string;
    description?: string;
    issue_number?: string;
    quantity?: number;
    cover_url?: string;
  };
}
const getCoverUrl = (coverFileName?: string) =>
  coverFileName
    ? `https://assets.comic-odyssey.com/products/covers/medium/${coverFileName}`
    : "";

export default function ReservationBoxScreen() {
  const [isGrid, setIsGrid] = useState(true);
  const colorScheme = useColorScheme();
  const store = useBoundStore();
  const navigation = useNavigation();
  const [reservations, setReservations] = useState<ExtendedReservationItemT[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 1500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Centralized color palette for light/dark mode
  const colors = {
    background: colorScheme === "dark" ? "#121212" : "#fff",
    surface: colorScheme === "dark" ? "#23262F" : "#F3F4F6",
    text: colorScheme === "dark" ? "#F3F4F6" : "#181A20",
    textSecondary: colorScheme === "dark" ? "#B5B5B5" : "#6B7280",
    border: colorScheme === "dark" ? "#23262F" : "#E5E7EB",
    placeholder: colorScheme === "dark" ? "#23262F" : "#E5E7EB",
    primary: "#3B82F6",
    error: "#EF4444",
    cardShadow: colorScheme === "dark" ? "#000000" : "#D1D5DB",
    icon: colorScheme === "dark" ? "#FFFFFF" : "#181A20",
  };

  // Initial load
  useEffect(() => {
    if (!store.user) {
      // @ts-ignore
      navigation.replace("Auth", { screen: "SignIn" });
      return;
    }
    setLoading(true);
    getReservationList(store.user.id, 1, PAGE_SIZE, debouncedQuery)
      .then((res) => {
        console.log("reservations", res.data);
        const reservationData = (res.data.reservations || []).filter(
          (item) => item.status !== "fill"
        );
        setReservations(reservationData);
        setPage(1);
        setTotalPages(res.data.metadata?.total_pages || 1);
        setTotalCount(res.data.metadata?.total_count);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch reservations:", err);
        setError("Failed to load your reservations. Please try again later.");
        setReservations([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [store.user, navigation, debouncedQuery]);

  // Accept both MasonryList ({item, i}) and FlatList ({item}) signatures
  const renderGridItem = ({
    item,
    i,
  }: {
    item: ExtendedReservationItemT;
    i?: number;
  }) => {
    const reservation = item;
    if (!reservation.product) return null;
    const sanitizedProduct = {
      ...reservation.product,
      cover_url:
        typeof reservation.product.cover_url === "string" &&
        reservation.product.cover_url.trim() !== ""
          ? reservation.product.cover_url
          : reservation.product.cover_file_name
          ? `https://assets.comic-odyssey.com/products/covers/medium/${reservation.product.cover_file_name}`
          : "",
      status: reservation.status,
    };
    const publisher = reservation.product.publisher || "";
    // Grid: image top, text below. List: image left, text right.
    if (isGrid) {
      return (
        <Pressable key={reservation.id}>
          <ReservationCard product={sanitizedProduct} />
        </Pressable>
      );
    } else {
      return (
        <Pressable key={reservation.id} style={{ flex: 1, padding: 8 }}>
          <View
            style={{
              flexDirection: "row",
              overflow: "hidden",
              alignItems: "center",
              shadowColor: colors.cardShadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.13,
              shadowRadius: 4,
            }}
          >
            <Image
              source={{ uri: sanitizedProduct.cover_url }}
              style={{
                width: 90,
                height: 90,
                backgroundColor: colors.placeholder,
                marginRight: 12,
              }}
              resizeMode="cover"
            />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontWeight: "bold",
                  fontFamily: "Urbanist-Black",
                  color: colors.text,
                  fontSize: 15,
                  marginBottom: 2,
                  maxWidth: 240,
                }}
              >
                {reservation.product.title}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: "PublicSans-Regular",
                  color: colors.textSecondary,
                  fontSize: 13,
                }}
              >
                {reservation.product.creators}
              </Text>
              {publisher ? (
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: "PublicSans-Regular",
                    color: colors.textSecondary,
                    fontSize: 12,
                  }}
                >
                  {publisher}
                </Text>
              ) : null}
              <Text
                style={{ color: colors.textSecondary, fontSize: 12 }}
                numberOfLines={1}
              >
                Status:{" "}
                {reservation.status === "for_approval"
                  ? "Pending Approval"
                  : reservation.status}
              </Text>
            </View>
          </View>
        </Pressable>
      );
    }
  };

  // No need to filter reservations on the frontend, as search is now server-side

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: 16, backgroundColor: colors.background }}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <NavigationHeader />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            fontFamily: "Urbanist-Bold",
            color: colors.text,
          }}
        >
          Reservation Box
        </Text>
        <TouchableOpacity
          style={{ padding: 8, borderRadius: 999 }}
          onPress={() => setIsGrid((prev) => !prev)}
        >
          {isGrid ? (
            <LayoutList size={24} color={colors.icon} />
          ) : (
            <LayoutGrid size={24} color={colors.icon} />
          )}
        </TouchableOpacity>
      </View>
      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={{ position: "relative" }}>
          <TextInput
            placeholder="Search by title..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 8,
              padding: 10,
              fontSize: 16,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
              paddingRight: 36,
            }}
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
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
              <Text style={{ fontSize: 18, color: colors.textSecondary }}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {isGrid ? (
        <MasonryList
          data={reservations}
          renderItem={renderGridItem}
          numColumns={3}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                backgroundColor: colors.background,
                justifyContent: "center",
                alignItems: "center",
                marginTop: Dimensions.get("window").height / 4,
                padding: 16,
              }}
            >
              <Text
                style={{
                  fontFamily: "PublicSans-Regular",
                  color: colors.textSecondary,
                }}
              >
                We couldn't find any items in your reservation box
                {searchQuery.length > 0
                  ? " that matches, '" + searchQuery + "'"
                  : ""}
              </Text>
            </View>
          }
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          onEndReached={async () => {
            if (isFetchingMore || page >= totalPages) return;
            setIsFetchingMore(true);
            try {
              const nextPage = page + 1;
              const res = await getReservationList(
                store.user.id,
                nextPage,
                PAGE_SIZE,
                debouncedQuery
              );
              const newReservations = (res.data.reservations || []).filter(
                (item) => item.status !== "fill"
              );
              setReservations((prev) => {
                const existingIds = new Set(prev.map((item) => item.id));
                const filtered = newReservations.filter(
                  (item) => !existingIds.has(item.id)
                );
                const combined = [...prev, ...filtered];
                return combined;
              });
              setPage(nextPage);
              setTotalPages(res.data.metadata?.total_pages || totalPages);
            } catch (err) {
              console.error("Failed to fetch more reservations:", err);
            } finally {
              setIsFetchingMore(false);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore && page < totalPages ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ margin: 16 }}
              />
            ) : null
          }
        />
      ) : (
        <FlatList
          data={reservations}
          renderItem={renderGridItem}
          numColumns={1}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          onEndReached={async () => {
            if (isFetchingMore || page >= totalPages) return;
            setIsFetchingMore(true);
            try {
              const nextPage = page + 1;
              const res = await getReservationList(
                store.user.id,
                nextPage,
                PAGE_SIZE,
                debouncedQuery
              );
              const newReservations = (res.data.reservations || []).filter(
                (item) => item.status !== "fill"
              );
              setReservations((prev) => {
                const existingIds = new Set(prev.map((item) => item.id));
                const filtered = newReservations.filter(
                  (item) => !existingIds.has(item.id)
                );
                const combined = [...prev, ...filtered];
                return combined;
              });
              setPage(nextPage);
              setTotalPages(res.data.metadata?.total_pages || totalPages);
            } catch (err) {
              console.error("Failed to fetch more reservations:", err);
            } finally {
              setIsFetchingMore(false);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore && page < totalPages ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ margin: 16 }}
              />
            ) : null
          }
        />
      )}
      <View style={{ alignItems: "center", marginVertical: 8 }}>
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
          Showing {Math.min(reservations.length, totalCount)} of {totalCount}{" "}
          reserved items
        </Text>
      </View>
    </SafeAreaView>
  );
}
