import { useState, useEffect, useCallback } from "react";
import { useBoundStore } from "@/src/store";
import { useToast, Toast, ToastTitle } from "@/src/components/ui/toast";
import { useWantListStore } from "@/src/store/slices/WantListSlice";
import { useNavigation } from "@react-navigation/native";
import { debounce } from "lodash";
import Constants from "expo-constants";
import {
  fetchProducts,
  fetchProductsByReleaseId,
  fetchReleases,
  addToWantList,
  getWantList,
  getReservationList,
  addToReservation,
  confirmReservationList,
  searchReservationProducts,
} from "@/src/api/apiEndpoints";
import { ProductT, SearchOptions } from "@/src/utils/types/common";
import React from "react";

interface Release {
  id: number;
  title: string;
  release_date: string;
  status: string;
  products_count: number;
  reservations_total: number;
  customers_count: number;
}

export const useReservationManager = () => {
  const store = useBoundStore();
  const toast = useToast();
  const navigation = useNavigation();
  const incrementWantlistCount = useWantListStore(
    (state) => state.incrementWantlistCount
  );

  // State management
  const [wantedProductIds, setWantedProductIds] = useState<number[]>([]);
  const [releaseDates, setReleaseDates] = useState<Release[]>([]);
  const [products, setProducts] = useState<ProductT[]>([]);
  const [userReservationProductIds, setUserReservationProductIds] = useState<
    number[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedReleaseId, setSelectedReleaseId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [confirmationProducts, setConfirmationProducts] = useState<ProductT[]>(
    []
  );
  const [uncheckedProducts, setUncheckedProducts] = useState<number[]>([]);

  // Computed properties
  const reservedProductIds = products
    .filter((p) => p.meta_attributes?.reserved)
    .map((p) => p.id);

  // API Interactions
  const fetchReleaseDatesFromAPI = async () => {
    try {
      setLoading(true);
      const response = await fetchReleases()
        .then((res) => {
          setReleaseDates(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch release dates:", err);
      setError("Failed to load release dates");
      setLoading(false);
    }
  };

  const loadProductsByRelease = async (id: number | null) => {
    try {
      setLoading(true);
      if (id) {
        const response = await fetchProductsByReleaseId(id);
        setProducts(response.data);
        setLoading(false);
      } else {
        const response = await fetchProducts();
        setProducts(response.data);
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch releases:", err);
      setError("Failed to load releases");
      setLoading(false);
    }
  };

  // Helper functions
  const getLatestRelease = (entries: Release[]): Release | null => {
    if (!entries || entries.length === 0) return null;
    const validStatuses = ["publish", "close"];
    const filtered = entries.filter((rel) =>
      validStatuses.includes(rel.status)
    );
    if (filtered.length === 0) return null;
    return filtered.reduce((latest, rel) =>
      new Date(rel.release_date) > new Date(latest.release_date) ? rel : latest
    );
  };

  const isOldRelease = (): boolean => {
    const latest = getLatestRelease(releaseDates);
    return Boolean(
      latest && selectedReleaseId && selectedReleaseId !== latest.id
    );
  };

  const formatDateHuman = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Drawer & Filters
  const toggleDrawer = () => {
    setShowDrawer(!showDrawer);
  };

  const clearFilters = () => {
    const latest = getLatestRelease(releaseDates);
    if (latest) {
      setSelectedReleaseId(latest.id);
      setSelectedDate(latest.release_date);
      loadProductsByRelease(latest.id);
    } else {
      setSelectedReleaseId(null);
      setSelectedDate("");
      loadProductsByRelease(null);
    }
  };

  const handleSelectDate = (id: number, date: string) => {
    setSelectedDate(date);
    setSelectedReleaseId(id);
    setShowDrawer(false);
    loadProductsByRelease(id);
  };

  // Selection & Reservation handling
  const toggleProductSelection = (productId: number) => {
    // Prevent selecting if viewing a past release
    if (isOldRelease()) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="warning">
            <ToastTitle>Cannot reserve from past releases</ToastTitle>
          </Toast>
        ),
      });
      return;
    }

    // Prevent selecting if product is already in user's reservation list
    if (userReservationProductIds.includes(productId)) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="warning">
            <ToastTitle>Already in your reservation list</ToastTitle>
          </Toast>
        ),
      });
      return;
    }

    // Toggle selection for valid products
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const toggleMultiSelectMode = () => {
    // Prevent multi-select mode for old releases
    if (isOldRelease() && !isMultiSelectMode) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="warning">
            <ToastTitle>Cannot reserve from past releases</ToastTitle>
          </Toast>
        ),
      });
      return;
    }

    if (isMultiSelectMode) {
      setIsMultiSelectMode(false);
      setSelectedProducts([]);
    } else {
      setIsMultiSelectMode(true);
    }
  };

  const showConfirmationDialog = () => {
    if (selectedProducts.length === 0) return;

    // Get the selected product objects from the products list
    const productsToConfirm = products.filter((product) =>
      selectedProducts.includes(product.id)
    );

    // Reset unchecked products list when opening modal
    setUncheckedProducts([]);
    setConfirmationProducts(productsToConfirm);
    setShowConfirmationModal(true);
  };

  const handleCheckboxToggle = (productId: number, checked: boolean) => {
    if (!checked) {
      // Add to unchecked list when unchecked
      setUncheckedProducts((prev) => [...prev, productId]);
    } else {
      // Remove from unchecked list when checked
      setUncheckedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const confirmReservation = async () => {
    try {
      // Close modal first
      setShowConfirmationModal(false);

      // Get only the product IDs that are still checked in the confirmation modal
      const finalSelectedProducts = confirmationProducts
        .filter((p) => !uncheckedProducts.includes(p.id))
        .map((p) => p.id);

      if (finalSelectedProducts.length === 0) {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={"toast-" + id} action="warning">
              <ToastTitle>No products selected for reservation</ToastTitle>
            </Toast>
          ),
        });
        return;
      }

      // Step 1: Add all selected products to reservation list and collect reservation IDs
      const addToReservationResponses = await Promise.all(
        finalSelectedProducts.map((productId) =>
          addToReservation(productId, 1, selectedReleaseId)
        )
      );

      // Extract reservation IDs from the responses
      const reservationIds = addToReservationResponses.map(
        (response) => response.data.id
      );

      // Step 2: Confirm the reservation by submitting it to the backend
      await confirmReservationList(
        selectedReleaseId,
        reservationIds,
        finalSelectedProducts
      );

      // Update local products state to show as reserved
      setProducts((prev) =>
        prev.map((product) => {
          if (finalSelectedProducts.includes(product.id)) {
            return {
              ...product,
              meta_attributes: {
                ...product.meta_attributes,
                reserved: true,
              },
            };
          }
          return product;
        })
      );

      // Also update the userReservationProductIds to mark these as already reserved
      setUserReservationProductIds((prevIds) => [
        ...prevIds,
        ...finalSelectedProducts,
      ]);

      setIsMultiSelectMode(false);
      setSelectedProducts([]);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="success">
            <ToastTitle>Reserved successfully!</ToastTitle>
          </Toast>
        ),
      });

      // Refresh the full reservation list to ensure everything is in sync
      if (store.user?.id) {
        getReservationList(store.user.id)
          .then((res) => {
            const reservationProducts = res.data.reservations || [];
            const productIds = reservationProducts
              .map((item: any) => item.product?.id)
              .filter((id) => id !== undefined);
            setUserReservationProductIds(productIds);

            // Update the global orders count in the store to reflect on the profile page
            store.setOrdersCount(res.data.metadata?.total_count || 0);
          })
          .catch((err) => {
            console.error("Failed to refresh reservation list:", err);
          });
      }
    } catch (e) {
      console.log(e);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="error">
            <ToastTitle>Failed to reserve products.</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  // Add to want list functionality
  const addToWantListHandler = async (productId: number) => {
    try {
      await addToWantList(productId);
      setWantedProductIds([...wantedProductIds, productId]);
      incrementWantlistCount();
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  // Search functionality
  const performSearch = useCallback(
    debounce(async (query: string) => {
      console.log("Performing search for:", query);
      if (!query.trim()) {
        // If search is cleared, reload products by release
        loadProductsByRelease(selectedReleaseId);
        return;
      }

      setIsSearching(true);
      try {
        const options: SearchOptions = {};
        if (selectedReleaseId) {
          options.release_id = selectedReleaseId;
        }

        const response = await searchReservationProducts(query, options);

        // Map the search response to products format with unique IDs for list rendering
        const searchProducts = response.data.reservations.map((item: any) => {
          const baseUrl = Constants.expoConfig?.extra?.apiUrl || "";
          const coverUrl =
            item.product.cover_url ||
            `${baseUrl}/products/${item.product.id}/cover?v=${new Date(
              item.product.cover_updated_at
            ).getTime()}`;

          return {
            ...item.product,
            meta_attributes: {
              ...item.product.meta_attributes,
              reserved: item.reserved,
            },
            quantity: item.quantity,
            formatted_price: item.price,
            // Add cover URL for images
            cover_url: coverUrl,
            // Use this for unique list keys
            _uniqueKey: `${item.product.id}-${item.id}`,
          };
        });

        setProducts(searchProducts);
      } catch (err) {
        console.error("Search failed:", err);
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={"toast-" + id} action="error">
              <ToastTitle>Search failed. Please try again.</ToastTitle>
            </Toast>
          ),
        });
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [selectedReleaseId]
  );

  const handleSearchChange = (text: string) => {
    console.log("Search input changed:", text);
    setSearchQuery(text);
    // Don't call performSearch here if text is empty to prevent loops
    if (text.trim()) {
      performSearch(text);
    } else if (text === "") {
      console.log("Search cleared, reloading products");
      loadProductsByRelease(selectedReleaseId);
    }
  };

  const clearSearch = () => {
    console.log("Clear search called");
    setSearchQuery("");
    setShowSearchBar(false);

    if (products.length === 0 || searchQuery.trim() !== "") {
      console.log("Reloading products after clear search");
      loadProductsByRelease(selectedReleaseId);
    }
  };

  // Initialize data
  useEffect(() => {
    getWantList().then((res) => {
      const ids = res.data.want_lists.map((item: any) => item.product_id);
      setWantedProductIds(ids);
    });

    // Get user's reservation list to prevent duplicate reservations
    if (store.user?.id) {
      getReservationList(store.user.id)
        .then((res) => {
          console.log("Reservation list response:", res.data.reservations);
          const reservationProducts = res.data.reservations || [];
          // Extract product IDs from the reservation items
          // The response shows product as [Object], so we need to access product.id
          const productIds = reservationProducts
            .map((item: any) => item.product?.id)
            .filter((id) => id !== undefined);
          setUserReservationProductIds(productIds);
          store.setOrdersCount(res.data.metadata?.total_count || 0);
        })
        .catch((err) => {
          console.error("Failed to fetch reservation list:", err);
        });
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await fetchReleaseDatesFromAPI();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (releaseDates.length > 0) {
      const latest = getLatestRelease(releaseDates);
      if (latest) {
        setSelectedDate(latest.release_date);
        setSelectedReleaseId(latest.id);
        loadProductsByRelease(latest.id);
      }
    }
  }, [releaseDates]);

  // Navigate to product detail
  const navigateToProduct = (product: ProductT) => {
    getReservationList(store.user?.id).then((res) => {
      const reservationList = res.data.reservations;
      // @ts-ignore
      navigation.navigate("Product", {
        product: product,
        fromReservations: true,
        reservationId: selectedReleaseId,
        reservationList,
      });
    });
  };

  return {
    // State
    wantedProductIds,
    releaseDates,
    products,
    reservedProductIds,
    userReservationProductIds,
    loading,
    error,
    selectedProducts,
    isMultiSelectMode,
    showDrawer,
    selectedDate,
    selectedReleaseId,
    searchQuery,
    isSearching,
    showSearchBar,
    imageErrors,
    showConfirmationModal,
    confirmationProducts,
    uncheckedProducts,

    // UI State Setters
    setImageErrors,
    setShowSearchBar,
    setShowConfirmationModal,

    // API/Data Methods
    fetchReleaseDatesFromAPI,
    loadProductsByRelease,
    getLatestRelease,

    // UI Methods
    formatDateHuman,
    toggleDrawer,
    handleSelectDate,
    clearFilters,
    isOldRelease,

    // Reservation Methods
    toggleProductSelection,
    toggleMultiSelectMode,
    showConfirmationDialog,
    confirmReservation,
    handleCheckboxToggle,
    addToWantListHandler,
    navigateToProduct,

    // Search Methods
    handleSearchChange,
    clearSearch,
    performSearch,
  };
};
