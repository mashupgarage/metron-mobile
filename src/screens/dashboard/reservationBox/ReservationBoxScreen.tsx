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
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        className={`flex-1 ${
          colorScheme === "dark" ? "bg-mdark-background" : "bg-white"
        }`}
      >
        <Text
          style={{ alignSelf: "center" }}
          className={
            colorScheme === "dark" ? "text-mdark-text" : "text-gray-900"
          }
        >
          Loading your reservations...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        className={`flex-1 ${
          colorScheme === "dark" ? "bg-mdark-background" : "bg-white"
        }`}
      >
        <Text
          className={
            colorScheme === "dark" ? "text-mdark-text" : "text-red-500"
          }
        >
          {error}
        </Text>
      </SafeAreaView>
    );
  }

  if (reservations.length === 0) {
    return (
      <SafeAreaView
        className={`flex-1 ${
          colorScheme === "dark" ? "bg-mdark-background" : "bg-white"
        }`}
      >
        <Text
          className={
            colorScheme === "dark" ? "text-mdark-text" : "text-gray-900"
          }
        >
          Your reservation box is empty.
        </Text>
        <Text
          className={
            colorScheme === "dark" ? "text-mdark-text" : "text-gray-900"
          }
        >
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
        className={`m-2 rounded-xl max-w-[48%] overflow-hidden bg-mdark-surface shadow-md flex-1`}
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
          <View className="w-full h-44 items-center justify-center bg-gray-100 dark:bg-mdark-surface rounded-xl">
            <Image
              source={require("@/src/assets/icon.png")}
              className="w-20 h-20 opacity-60"
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
            className="w-full h-44 rounded-t-xl"
            resizeMode="cover"
            onError={() => {
              // console.log("Image failed to load:", coverUrl);
              setImageErrors((prev) => ({ ...prev, [productId]: true }));
            }}
          />
        )}
        <View className="p-3">
          <Text
            className={`text-lg font-bold mb-1 ${
              colorScheme === "dark" ? "text-mdark-text" : "text-gray-900"
            }`}
            numberOfLines={1}
          >
            {reservation.product.title}
          </Text>
          <Text
            className={`text-base font-semibold mb-1 ${
              colorScheme === "dark"
                ? "text-mdark-textSecondary"
                : "text-gray-600"
            }`}
          >
            {reservation.product.cover_price
              ? `$${reservation.product.cover_price}`
              : "Price unavailable"}
          </Text>
          {reservation.product.creators && (
            <Text className="text-xs text-gray-400 mb-1" numberOfLines={1}>
              {reservation.product.creators}
            </Text>
          )}
          {reservation.product.issue_number ? (
            <Text className="text-xs text-gray-400 mb-1">
              Issue: {reservation.product.issue_number}
            </Text>
          ) : (
            <View style={{ height: 15 }} />
          )}
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-xs text-gray-400">
              Qty: {reservation.quantity || 1}
            </Text>
            <Text className="text-xs font-semibold text-primary-400">
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

          {/* Availability indicator and Add to Cart button */}
          {/* <View style={styles.availabilityContainer}>
            <TouchableOpacity
              style={
                reservation.status === "for_approval"
                  ? styles.addToCartDisabled
                  : styles.addToCartButton
              }
              onPress={handleAddToCart}
              disabled={reservation.status === "for_approval"}
            >
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      className={`flex-1 pt-4 ${
        colorScheme === "dark" ? "bg-mdark-background" : "bg-white"
      }`}
    >
      <StatusBar style="auto" />
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-mdark-surface bg-mdark-background">
        <TouchableOpacity
          className="p-2 rounded-full"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View className="w-8" />
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
            console.log("API returned reservations:", res.data.reservations);
            const newReservations = (res.data.reservations || []).filter(
              (item) => item.status !== "fill"
            );
            setReservations((prev) => {
              const existingIds = new Set(prev.map((item) => item.id));
              const filtered = newReservations.filter(
                (item) => !existingIds.has(item.id)
              );
              const combined = [...prev, ...filtered];
              console.log(
                "Combined reservations count after append:",
                combined.length
              );
              // Update totalCount here to reflect only non-'fill' reservations
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
              color="#0000ff"
              style={{ margin: 16 }}
            />
          ) : null
        }
      />
      <View style={{ alignItems: "center", marginVertical: 8 }}>
        <Text className="text-xs text-gray-400">
          Showing {Math.min(reservations.length, totalCount)} of {totalCount}{" "}
          reserved items
        </Text>
      </View>
    </SafeAreaView>
  );
}
