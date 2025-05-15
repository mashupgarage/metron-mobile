import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { useBoundStore } from "@/src/store";
import { getReservationList, addToCart } from "@/src/api/apiEndpoints";
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

    const handleAddToCart = async () => {
      try {
        if (!store.user || !store.user.id) {
          Alert.alert("Error", "You need to be logged in to add items to cart");
          return;
        }

        await addToCart(store.user.id, reservation.product.id, reservation.id);

        Alert.alert(
          "Success",
          `${reservation.product.title} has been added to your cart`
        );
      } catch (error) {
        // Enhanced error logging
        console.error("Failed to add to cart. Details:", {
          error: error,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          errorName: error instanceof Error ? error.name : "Unknown error type",
          productId: reservation.product.id,
          productTitle: reservation.product.title,
          userId: store.user?.id,
        });

        Alert.alert(
          "Error",
          `Failed to add item to cart: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    };

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
            source={{ uri: coverUrl }}
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
                : reservation.status || "Pending"}
            </Text>
          </View>

          {/* Availability indicator and Add to Cart button */}
          <View style={styles.availabilityContainer}>
            {isAvailable && (
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
            )}
          </View>
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
            console.log("Fetching page:", nextPage);
            const res = await getReservationList(
              store.user.id,
              nextPage,
              PAGE_SIZE
            );
            // console.log('API returned reservations:', res.data.reservations);
            const newReservations = res.data.reservations || [];
            setReservations((prev) => {
              console.log("Previous reservations count:", prev.length);
              const existingIds = new Set(prev.map((item) => item.id));
              const filtered = newReservations.filter(
                (item) => !existingIds.has(item.id)
              );
              console.log("Filtered new reservations count:", filtered.length);
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#ffffff",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 16,
    flex: 1,
  },
  rightHeaderPlaceholder: {
    width: 40,
  },
  masonryListContainer: {
    paddingHorizontal: 6,
    paddingTop: 10,
  },
  gridItemContainer: {
    flex: 1,
    margin: 6,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  gridItemImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  gridItemDetails: {
    padding: 10,
  },
  gridItemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 3,
  },
  gridItemPrice: {
    fontSize: 13,
    color: "#28a745",
    fontWeight: "600",
    marginBottom: 3,
  },
  gridItemCreators: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 5,
  },
  gridItemIssue: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  reservationInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  reservationQuantity: {
    fontSize: 12,
    color: "#333",
  },
  reservationStatus: {
    fontSize: 12,
    color: "#1A237E",
    fontWeight: "500",
  },
  availabilityContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  availableText: {
    fontSize: 12,
    color: "#28a745",
    fontWeight: "500",
    marginBottom: 5,
  },
  unavailableText: {
    fontSize: 12,
    color: "#dc3545",
    fontWeight: "500",
  },
  addToCartButton: {
    backgroundColor: "#1A237E",
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 4,
  },
  addToCartDisabled: {
    backgroundColor: "#ccc",
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 4,
  },
  addToCartText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  messageText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#dc3545",
    marginTop: 8,
    textAlign: "center",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    marginBottom: 18,
    opacity: 0.2,
  },
});
