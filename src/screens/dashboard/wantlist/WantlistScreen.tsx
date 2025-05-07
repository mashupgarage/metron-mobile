import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  Alert,
} from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
import { useBoundStore } from "@/src/store";
import { getWantList, addToCart } from "@/src/api/apiEndpoints";
import { WantListItemT } from "@/src/utils/types/common";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Box } from "lucide-react-native";

// Helper function to construct image URL from cover_file_name
const getCoverUrl = (
  coverFileName: string | undefined,
  productId?: number
): string => {
  if (!coverFileName) return "";

  // Try format with just the filename
  return `https://assets.comic-odyssey.com/products/covers/medium/${coverFileName}`;
};

// Extended product type that includes quantity
interface ExtendedProduct {
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
}

// Extended WantListItem type
interface ExtendedWantListItemT extends Omit<WantListItemT, "product"> {
  product?: ExtendedProduct;
}

export default function WantlistScreen() {
  const store = useBoundStore();
  const navigation = useNavigation();
  const [wantlistItems, setWantlistItems] = useState<ExtendedWantListItemT[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!store.user) {
      // @ts-ignore
      navigation.replace("Auth", { screen: "SignIn" });
      return;
    }

    setLoading(true);
    getWantList()
      .then((res) => {
        // Log the response to check the structure
        console.log(
          "Want List API Response:",
          JSON.stringify(res.data.want_lists[0])
        );

        // Set the entire want_lists array as our data, properly cast to ExtendedWantListItemT
        setWantlistItems(res.data.want_lists as ExtendedWantListItemT[]);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch want list:", err);
        setError("Failed to load your want list. Please try again later.");
        setWantlistItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [store.user, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.messageText}>Loading your want list...</Text>
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

  if (wantlistItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.messageText}>Your want list is empty.</Text>
        <Text style={styles.messageText}>
          Add items you want by tapping "I want this" on product pages.
        </Text>
      </SafeAreaView>
    );
  }

  const renderGridItem = ({ item, i }: { item: unknown; i: number }) => {
    const wantlistItem = item as ExtendedWantListItemT;

    // Check if item has product
    if (!wantlistItem.product) {
      console.log("Missing product for item:", wantlistItem);
      return null; // Skip rendering this item
    }

    // Get cover URL
    const coverUrl = getCoverUrl(
      wantlistItem.product.cover_file_name,
      wantlistItem.product.id
    );
    const productId = wantlistItem.product.id;
    const hasImageError = imageErrors[productId] || !coverUrl;

    // Check if product is available (safely check with optional chaining)
    const isAvailable = wantlistItem.product?.quantity
      ? wantlistItem.product.quantity > 0
      : false;

    // Log for debugging
    if (!coverUrl) {
      console.log(
        "Cannot construct image URL because cover_file_name is missing:",
        wantlistItem.product.title
      );
    }

    const handleAddToCart = async () => {
      try {
        if (!store.user || !store.user.id) {
          Alert.alert("Error", "You need to be logged in to add items to cart");
          return;
        }

        await addToCart(
          store.user.id,
          wantlistItem.product.id,
          wantlistItem.id
        );

        Alert.alert(
          "Success",
          `${wantlistItem.product.title} has been added to your cart`
        );
      } catch (error) {
        // Enhanced error logging
        console.error("Failed to add to cart. Details:", {
          error: error,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          errorName: error instanceof Error ? error.name : "Unknown error type",
          productId: wantlistItem.product.id,
          productTitle: wantlistItem.product.title,
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
      <Pressable
        style={styles.gridItemContainer}
        onPress={() => {
          console.log("Pressed item:", wantlistItem.product?.title);
        }}
      >
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
              console.log("Image failed to load:", coverUrl);
              setImageErrors((prev) => ({ ...prev, [productId]: true }));
            }}
          />
        )}
        <View style={styles.gridItemDetails}>
          <Text style={styles.gridItemTitle} numberOfLines={1}>
            {wantlistItem.product.title}
          </Text>
          <Text style={styles.gridItemPrice}>
            {wantlistItem.product.cover_price
              ? `$${wantlistItem.product.cover_price}`
              : "Price unavailable"}
          </Text>
          {wantlistItem.product.creators && (
            <Text style={styles.gridItemCreators} numberOfLines={1}>
              {wantlistItem.product.creators}
            </Text>
          )}
          {wantlistItem.product.issue_number && (
            <Text style={styles.gridItemIssue}>
              Issue: {wantlistItem.product.issue_number}
            </Text>
          )}

          {/* Availability indicator and Add to Cart button */}
          <View style={styles.availabilityContainer}>
            <Text
              style={
                isAvailable ? styles.availableText : styles.unavailableText
              }
            >
              {isAvailable ? "Available" : "Out of Stock"}
            </Text>

            {isAvailable && (
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={handleAddToCart}
              >
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      {/* Information Section */}
      <View style={styles.infoContainer}>
        <View style={styles.infoHeader}>
          <TouchableOpacity
            style={styles.infoBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.infoTitle}>Your Want List</Text>
        </View>
        <Text style={styles.infoText}>
          This is your want list. Visit this page regularly to view the status
          of your want list. You will also get notified as soon as the product
          becomes available.
        </Text>
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            Please note that products are first pay, first serve basis.
          </Text>
        </View>
      </View>

      <MasonryList
        data={wantlistItems}
        renderItem={renderGridItem}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.masonryListContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
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
    width: 40, // Same width as back button for symmetry
  },
  masonryListContainer: {
    paddingHorizontal: 6,
    paddingTop: 10,
    backgroundColor: "#ffffff",
  },
  gridItemContainer: {
    flex: 1,
    margin: 8,
    marginBottom: 2,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
    padding: 4,
  },
  gridItemImage: {
    width: "100%",
    height: 192,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  gridItemDetails: {
    padding: 10,
    marginTop: 2,
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
  },
  gridItemIssue: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  messageText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  infoContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoBackButton: {
    padding: 4,
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
  },
  noteContainer: {
    backgroundColor: "#FFF9E6",
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F0E0A0",
  },
  noteText: {
    fontSize: 14,
    color: "#8B6E00",
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
  addToCartText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  placeholderContainer: {
    width: "100%",
    height: 192,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderImage: {
    width: "60%",
    height: "60%",
    opacity: 0.7,
  },
});
