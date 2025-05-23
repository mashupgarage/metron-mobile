import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useColorScheme } from "react-native";
import { useBoundStore } from "@/src/store";
import { getReservationList } from "@/src/api/apiEndpoints";
import { ReservationItemT } from "@/src/utils/types/common";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

const PAGE_SIZE = 10;

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

  // Centralized color palette for light/dark mode
  const colors = {
    background: colorScheme === "dark" ? "#181A20" : "#FFFFFF",
    surface: colorScheme === "dark" ? "#23262F" : "#F3F4F6",
    text: colorScheme === "dark" ? "#F3F4F6" : "#181A20",
    textSecondary: colorScheme === "dark" ? "#B5B5B5" : "#6B7280",
    border: colorScheme === "dark" ? "#23262F" : "#E5E7EB",
    placeholder: colorScheme === "dark" ? "#444857" : "#E5E7EB",
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
    getReservationList(store.user.id, 1, PAGE_SIZE)
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
  }, [store.user, navigation]);

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ alignSelf: "center", color: colors.text }}>
          Loading your reservations...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Text style={{ color: colors.error, margin: 16 }}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (reservations.length === 0) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.text, marginBottom: 8 }}>
          Your reservation box is empty.
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          Add items to your reservation box by visiting the Reservations tab.
        </Text>
      </SafeAreaView>
    );
  }

  const renderGridItem = ({ item }: { item: ExtendedReservationItemT }) => {
    const reservation = item;

    // Check if item has product
    if (!reservation.product) {
      // console.log("Missing product for reservation:", reservation);
      return null; // Skip rendering this item
    }

    // Get cover URL
    const coverUrl = getCoverUrl(
      reservation.product.cover_file_name
      // reservation.product.id
    );
    const productId = reservation.product.id;
    const hasImageError = imageErrors[productId] || !coverUrl;

    // Check if product is available (safely check with optional chaining)
    const isAvailable = reservation.product?.quantity
      ? reservation.product.quantity > 0
      : false;

    // Log for debugging
    if (!coverUrl) {
      // console.log(
      //   "Cannot construct image URL because cover_file_name is missing:",
      //   reservation.product.title
      // );
    }

    return (
      <TouchableOpacity
        style={{
          margin: 8,
          borderRadius: 16,
          maxWidth: "48%",
          overflow: "hidden",
          backgroundColor: colors.surface,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          flex: 1,
        }}
        onPress={() => {
          if (reservation.product) {
            // Create a sanitized copy of the product with a valid cover_url
            const sanitizedProduct = {
              ...reservation.product,
              // Ensure cover_url is a valid string URL
              cover_url:
                typeof reservation.product.cover_url === "string" &&
                reservation.product.cover_url.trim() !== ""
                  ? reservation.product.cover_url
                  : reservation.product.cover_file_name
                  ? `https://assets.comic-odyssey.com/products/covers/medium/${reservation.product.cover_file_name}`
                  : "",
            };

            // @ts-ignore
            navigation.navigate("Product", {
              product: sanitizedProduct,
              fromReservations: true,
            });
          }
        }}
      >
        {hasImageError ? (
          // Show placeholder when there's an error or no URL
          <View
            style={{
              width: "100%",
              height: 176,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.placeholder,
              borderRadius: 16,
            }}
          >
            <Image
              source={require("@/src/assets/icon.png")}
              style={{ width: 80, height: 80, opacity: 0.6 }}
              resizeMode="contain"
            />
          </View>
        ) : (
          // Try to load actual image
          <Image
            source={{
              uri:
                coverUrl ??
                `https://assets.comic-odyssey.com/products/covers/medium/${reservation.product?.cover_file_name}`,
            }}
            style={{
              width: "100%",
              height: 176,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
            resizeMode="cover"
            onError={() => {
              setImageErrors((prev) => ({ ...prev, [productId]: true }));
            }}
          />
        )}
        <View style={{ padding: 12 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 4,
              color: colors.text,
            }}
            numberOfLines={1}
          >
            {reservation.product.title}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 4,
              color: colors.textSecondary,
            }}
          >
            {reservation.product.cover_price
              ? `$${reservation.product.cover_price}`
              : "Price unavailable"}
          </Text>
          {reservation.product.creators && (
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {reservation.product.creators}
            </Text>
          )}
          {reservation.product.issue_number ? (
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginBottom: 4,
              }}
            >
              Issue: {reservation.product.issue_number}
            </Text>
          ) : (
            <View style={{ height: 15 }} />
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Qty: {reservation.quantity || 1}
            </Text>
            <Text
              style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}
            >
              {reservation.status === "for_approval"
                ? "For Approval"
                : reservation.status === "external"
                ? "Short"
                : reservation.status === "void"
                ? "Void"
                : reservation.status === "internal"
                ? "Damaged/Lost"
                : "Approved"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: 16, backgroundColor: colors.background }}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <TouchableOpacity
          style={{ padding: 8, borderRadius: 999 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.icon} />
        </TouchableOpacity>
        <View style={{ width: 32 }} />
      </View>
      <FlatList
        data={reservations}
        renderItem={renderGridItem}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        onEndReached={async () => {
          if (isFetchingMore || page >= totalPages) return;
          setIsFetchingMore(true);
          try {
            const nextPage = page + 1;
            const res = await getReservationList(
              store.user.id,
              nextPage,
              PAGE_SIZE
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
      <View style={{ alignItems: "center", marginVertical: 8 }}>
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
          Showing {Math.min(reservations.length, totalCount)} of {totalCount}{" "}
          reserved items
        </Text>
      </View>
    </SafeAreaView>
  );
}
