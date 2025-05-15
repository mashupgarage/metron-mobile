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
import { useBoundStore } from "@/src/store";
import { getReservationList } from "@/src/api/apiEndpoints";
import { ReservationItemT } from "@/src/utils/types/common";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./style";

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
  };
}
const getCoverUrl = (coverFileName?: string) =>
  coverFileName
    ? `https://assets.comic-odyssey.com/products/covers/medium/${coverFileName}`
    : "";

export default function ReservationBoxScreen() {
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
        const reservationData = res.data.reservations || [];
        setReservations(reservationData);
        setPage(1);
        setTotalPages(res.data.metadata?.total_pages || 1);
        setTotalCount(res.data.metadata?.total_count || reservationData.length);
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
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.messageText}>Loading your reservations...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (reservations.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.messageText}>Your reservation box is empty.</Text>
        <Text style={styles.messageText}>
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
      <View style={styles.gridItemContainer}>
        {hasImageError ? (
          // Show placeholder when there's an error or no URL
          <View style={styles.placeholderContainer}>
            <Image
              source={require("@/src/assets/icon.png")}
              style={styles.placeholderImage}
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
            style={styles.gridItemImage}
            resizeMode="cover"
            onError={() => {
              // console.log("Image failed to load:", coverUrl);
              setImageErrors((prev) => ({ ...prev, [productId]: true }));
            }}
          />
        )}
        <View style={styles.gridItemDetails}>
          <Text style={styles.gridItemTitle} numberOfLines={1}>
            {reservation.product.title}
          </Text>
          <Text style={styles.gridItemPrice}>
            {reservation.product.cover_price
              ? `$${reservation.product.cover_price}`
              : "Price unavailable"}
          </Text>
          {reservation.product.creators && (
            <Text style={styles.gridItemCreators} numberOfLines={1}>
              {reservation.product.creators}
            </Text>
          )}
          {reservation.product.issue_number ? (
            <Text style={styles.gridItemIssue}>
              Issue: {reservation.product.issue_number}
            </Text>
          ) : (
            <View style={{ height: 15 }} />
          )}
          <View style={styles.reservationInfo}>
            <Text style={styles.reservationQuantity}>
              Qty: {reservation.quantity || 1}
            </Text>
            <Text style={styles.reservationStatus}>
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
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservation Box</Text>
        <View style={styles.rightHeaderPlaceholder} />
      </View>
      <FlatList
        data={reservations}
        renderItem={renderGridItem}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.masonryListContainer}
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
            // console.log('API returned reservations:', res.data.reservations);
            const newReservations = res.data.reservations || [];
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
              return combined;
            });
            setPage(nextPage);
            setTotalPages(res.data.metadata?.total_pages || totalPages);
            setTotalCount(res.data.metadata?.total_count || totalCount);
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
        <Text style={{ color: "#888" }}>
          Showing {Math.min(reservations.length, totalCount)} of {totalCount}{" "}
          reserved items
        </Text>
      </View>
    </SafeAreaView>
  );
}
