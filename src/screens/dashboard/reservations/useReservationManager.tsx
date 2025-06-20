import { useState, useEffect, useCallback } from "react"
import { useBoundStore } from "@/src/store"
import { useToast, Toast, ToastTitle } from "@/src/components/ui/toast"
import { useNavigation } from "@react-navigation/native"
import { debounce } from "lodash"
import Constants from "expo-constants"
import {
  fetchProductsByReleaseId,
  fetchReleases,
  addToWantList,
  getWantList,
  getReservationList,
  checkReservationEntry,
  createReservationEntry,
  addProductsToReservation,
  submitReservation,
  fetchReservationProducts,
  searchReservationProducts,
} from "@/src/api/apiEndpoints"
import { ProductT, SearchOptions } from "@/src/utils/types/common"
import React from "react"

interface Release {
  id: number
  title: string
  release_date: string
  status: string
  products_count: number
  reservations_total: number
  customers_count: number
}

// Define standard page size
const PAGE_SIZE = 10

export const useReservationManager = () => {
  const store = useBoundStore()
  const toast = useToast()
  const navigation = useNavigation()
  const incrementWantlistCount = useBoundStore(
    (state) => state.incrementWantlistCount
  )

  // State management
  const [wantedProductIds, setWantedProductIds] = useState<number[]>([])
  const [releaseDates, setReleaseDates] = useState<Release[]>([])
  const [products, setProducts] = useState<ProductT[]>([])
  // Holds the current reservation list ID for the selected release, if any
  const [reservationListId, setReservationListId] = useState<number | null>(
    null
  )
  // Holds the products currently in the reservation entry
  const [productsInReservation, setProductsInReservation] = useState<any[]>([])
  const [userReservationProductIds, setUserReservationProductIds] = useState<
    number[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedReleaseId, setSelectedReleaseId] = useState<number | null>(
    null
  )
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false)
  const [confirmationProducts, setConfirmationProducts] = useState<ProductT[]>(
    []
  )
  const [uncheckedProducts, setUncheckedProducts] = useState<number[]>([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  // Computed properties
  const reservedProductIds = (() => {
    // Check if products is an array
    if (Array.isArray(products)) {
      return products
        .filter((p) => p.meta_attributes?.reserved)
        .map((p) => p.id)
    }
    // If products is an object with some properties, try to handle it
    else if (products && typeof products === "object") {
      console.log("Products is an object, not an array:", products)
      return []
    }
    // Default empty array
    return []
  })()

  // API Interactions
  const fetchReleaseDatesFromAPI = async () => {
    try {
      setLoading(true)
      const response = await fetchReleases()
        .then((res) => {
          setReleaseDates(res.data)
        })
        .catch((err) => {
          console.log(err)
        })
      setLoading(false)
    } catch (err) {
      console.error("Failed to fetch release dates:", err)
      setError("Failed to load release dates")
      setLoading(false)
    }
  }

  const loadProductsByRelease = async (
    id: number | null,
    page = 1,
    resetList = true
  ) => {
    try {
      // Only show full loading indicator on first page or reset
      if (page === 1 || resetList) {
        setLoading(true)
      } else {
        setIsFetchingMore(true)
      }

      if (id) {
        const response = await fetchProductsByReleaseId(id, page, PAGE_SIZE)

        // Extract products and pagination info
        let productsArray: ProductT[] = []
        let totalItems = 0
        let totalPagesCount = 1
        let currentPageValue = page

        if (Array.isArray(response.data)) {
          productsArray = response.data
          // If it's just an array, assume it's the full list
          totalItems = response.data.length
        } else if (response.data && typeof response.data === "object") {
          // Check for common API response patterns
          if ("products" in response.data) {
            productsArray = response.data.products
            totalItems = response.data.total_count || productsArray.length
            totalPagesCount = response.data.total_pages || 1
            currentPageValue = response.data.current_page || page
          } else if ("data" in response.data) {
            productsArray = response.data.data
            totalItems = response.data.meta?.total || productsArray.length
            totalPagesCount = response.data.meta?.last_page || 1
            currentPageValue = response.data.meta?.current_page || page
          } else {
            // Try to convert to array if no recognized structure
            productsArray = Object.values(response.data || {}) as ProductT[]
            totalItems = productsArray.length
          }
        }

        // Update state based on whether we're appending or replacing
        if (page === 1 || resetList) {
          setProducts(productsArray)
        } else {
          setProducts((prevProducts) => [...prevProducts, ...productsArray])
        }

        // Update pagination state
        setTotalCount(totalItems)
        setTotalPages(totalPagesCount)
        setCurrentPage(currentPageValue)
        setHasMore(currentPageValue < totalPagesCount)
      } else {
        setProducts([])
        setTotalCount(0)
        setTotalPages(1)
        setCurrentPage(1)
        setHasMore(false)
      }
    } catch (err) {
      console.error("Failed to fetch releases:", err)
      setError("Failed to load releases")
    } finally {
      setLoading(false)
      setIsFetchingMore(false)
    }
  }

  // Function to load more products (next page)
  const loadMoreProducts = useCallback(() => {
    // Don't fetch if already fetching, no more pages, or initial loading
    if (isFetchingMore || loading || !hasMore || !selectedReleaseId) {
      return
    }

    loadProductsByRelease(selectedReleaseId, currentPage + 1, false)
  }, [currentPage, hasMore, isFetchingMore, loading, selectedReleaseId])

  // Helper functions
  const getLatestRelease = (entries: Release[]): Release | null => {
    if (!entries || entries.length === 0) return null
    const validStatuses = ["publish", "close"]
    const filtered = entries.filter((rel) => validStatuses.includes(rel.status))
    if (filtered.length === 0) return null
    return filtered.reduce((latest, rel) =>
      new Date(rel.release_date) > new Date(latest.release_date) ? rel : latest
    )
  }

  const isOldRelease = (): boolean => {
    const latest = getLatestRelease(releaseDates)
    const selectedRelease = releaseDates.find((r) => r.id === selectedReleaseId)

    return Boolean(
      (latest && selectedReleaseId && selectedReleaseId !== latest.id) ||
        (selectedRelease && selectedRelease.status === "close")
    )
  }

  const formatDateHuman = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
  }

  // Drawer & Filters
  const toggleDrawer = () => {
    setShowDrawer(!showDrawer)
  }

  const clearFilters = () => {
    const latest = getLatestRelease(releaseDates)
    if (latest) {
      setSelectedReleaseId(latest.id)
      setSelectedDate(latest.release_date)
      loadProductsByRelease(latest.id, 1, true)
    } else {
      setSelectedReleaseId(null)
      setSelectedDate("")
      loadProductsByRelease(null)
    }
  }

  const handleSelectDate = (id: number, date: string) => {
    setSelectedDate(date)
    setSelectedReleaseId(id)
    setShowDrawer(false)
    // Reset to page 1 when selecting a new date
    setCurrentPage(1)
    loadProductsByRelease(id, 1, true)
  }

  // Selection & Reservation handling
  const toggleProductSelection = (productId: number) => {
    // Prevent selecting if viewing a past release
    if (isOldRelease()) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action='warning'>
            <ToastTitle>Cannot reserve from past releases</ToastTitle>
          </Toast>
        ),
      })
      return
    }

    // Prevent selecting if product is already in user's reservation list
    if (userReservationProductIds.includes(productId)) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action='warning'>
            <ToastTitle>Already in your reservation list</ToastTitle>
          </Toast>
        ),
      })
      return
    }

    // Toggle selection for valid products
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  const toggleMultiSelectMode = () => {
    // Prevent multi-select mode for old releases
    if (isOldRelease() && !isMultiSelectMode) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action='warning'>
            <ToastTitle>Cannot reserve from past releases</ToastTitle>
          </Toast>
        ),
      })
      return
    }

    if (isMultiSelectMode) {
      setIsMultiSelectMode(false)
      setSelectedProducts([])
    } else {
      setIsMultiSelectMode(true)
    }
  }

  const showConfirmationDialog = () => {
    if (selectedProducts.length === 0) return

    // Get the selected product objects from the products list
    let productsToConfirm = []

    // Check if products is an array
    if (Array.isArray(products)) {
      productsToConfirm = products.filter((product) =>
        selectedProducts.includes(product.id)
      )
    }
    // If products is an object, log it for debugging
    else if (products && typeof products === "object") {
      console.log("Products is an object in showConfirmationDialog:", products)
    }

    // Reset unchecked products list when opening modal
    setUncheckedProducts([])
    setConfirmationProducts(productsToConfirm)
    setShowConfirmationModal(true)
  }

  const handleCheckboxToggle = (productId: number, checked: boolean) => {
    if (!checked) {
      // Add to unchecked list when unchecked
      setUncheckedProducts((prev) => [...prev, productId])
    } else {
      // Remove from unchecked list when checked
      setUncheckedProducts((prev) => prev.filter((id) => id !== productId))
    }
  }

  // Helper: fetch products in reservation and update state
  const refreshProductsInReservation = async (reservationListId: number) => {
    try {
      const prodRes = await fetchReservationProducts(reservationListId)
      setProductsInReservation(prodRes.data || [])
    } catch {
      setProductsInReservation([])
    }
  }

  const confirmReservation = async () => {
    try {
      // Close modal first
      setShowConfirmationModal(false)

      // Get only the product IDs that are still checked in the confirmation modal
      const finalSelectedProducts = confirmationProducts
        .filter((p) => !uncheckedProducts.includes(p.id))
        .map((p) => p.id)

      if (finalSelectedProducts.length === 0) {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={"toast-" + id} action='warning'>
              <ToastTitle>No products selected for reservation</ToastTitle>
            </Toast>
          ),
        })
        return
      }

      // Get token from store (assumes user is logged in and token is available)
      if (!selectedReleaseId) {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={"toast-" + id} action='error'>
              <ToastTitle>Missing release.</ToastTitle>
            </Toast>
          ),
        })
        return
      }

      // Step 1: Use reservationListId if exists, otherwise create
      let currentReservationListId = reservationListId
      if (!currentReservationListId) {
        try {
          const createRes = await createReservationEntry(selectedReleaseId!)
          currentReservationListId = createRes.data.reservation_list_id
          setReservationListId(currentReservationListId)
        } catch (err) {
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={"toast-" + id} action='error'>
                <ToastTitle>Failed to create reservation entry.</ToastTitle>
              </Toast>
            ),
          })
          return
        }
      }

      // Step 2: Add only products not already in reservation
      const alreadyReservedIds = productsInReservation.map(
        (item: any) => item.product_id || item.id
      )
      const productsToAdd = finalSelectedProducts.filter(
        (id) => !alreadyReservedIds.includes(id)
      )
      if (productsToAdd.length > 0) {
        try {
          await addProductsToReservation(
            currentReservationListId!,
            productsToAdd,
            productsToAdd.map(() => 1)
          )
        } catch (err) {
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={"toast-" + id} action='error'>
                <ToastTitle>Failed to add products to reservation.</ToastTitle>
              </Toast>
            ),
          })
          return
        }
      }

      // Step 3: Submit reservation and get receipt
      try {
        await submitReservation(currentReservationListId!)
        // Optionally, handle/display receiptRes.data
      } catch (err) {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={"toast-" + id} action='error'>
              <ToastTitle>Failed to submit reservation.</ToastTitle>
            </Toast>
          ),
        })
        return
      }

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
            }
          }
          return product
        })
      )

      // Also update the userReservationProductIds to mark these as already reserved
      setUserReservationProductIds((prevIds) => [
        ...prevIds,
        ...finalSelectedProducts,
      ])

      setIsMultiSelectMode(false)
      setSelectedProducts([])
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action='success'>
            <ToastTitle>Reserved successfully!</ToastTitle>
          </Toast>
        ),
      })
    } catch (e) {
      console.log(e)
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action='error'>
            <ToastTitle>Failed to reserve products.</ToastTitle>
          </Toast>
        ),
      })
    }
  }

  // Add to want list functionality
  const addToWantListHandler = async (productId: number) => {
    try {
      await addToWantList(productId)
      setWantedProductIds([...wantedProductIds, productId])
      incrementWantlistCount()
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }

  // Search functionality
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        // If search is cleared, reload products by release
        loadProductsByRelease(selectedReleaseId, 1, true)
        return
      }

      setIsSearching(true)
      try {
        const options: SearchOptions = {}
        if (selectedReleaseId) {
          options.release_id = selectedReleaseId
        }

        const response = await searchReservationProducts(query, options)

        // Map the search response to products format with unique IDs for list rendering
        const searchProducts = response.data.reservations.map((item: any) => {
          const baseUrl = Constants.expoConfig?.extra?.apiUrl || ""
          const coverUrl =
            item.product.cover_url ||
            `${baseUrl}/products/${item.product.id}/cover?v=${new Date(
              item.product.cover_updated_at
            ).getTime()}`

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
          }
        })

        setProducts(searchProducts)
        setCurrentPage(1)
        setTotalCount(searchProducts.length)
        setTotalPages(1)
        setHasMore(false)
      } catch (err) {
        console.error("Search failed:", err)
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={"toast-" + id} action='error'>
              <ToastTitle>Search failed. Please try again.</ToastTitle>
            </Toast>
          ),
        })
      } finally {
        setIsSearching(false)
      }
    }, 500),
    [selectedReleaseId]
  )

  const handleSearchChange = (text: string) => {
    setSearchQuery(text)
    // Don't call performSearch here if text is empty to prevent loops
    if (text.trim()) {
      performSearch(text)
    } else if (text === "") {
      console.log("Search cleared, reloading products")
      loadProductsByRelease(selectedReleaseId, 1, true)
    }
  }

  const clearSearch = () => {
    console.log("Clear search called")
    setSearchQuery("")
    setShowSearchBar(false)

    // Check if products is an array before checking its length
    const shouldReloadProducts =
      !Array.isArray(products) ||
      products.length === 0 ||
      searchQuery.trim() !== ""

    if (shouldReloadProducts) {
      console.log("Reloading products after clear search")
      loadProductsByRelease(selectedReleaseId, 1, true)
    }
  }

  // Initialize data
  useEffect(() => {
    getWantList().then((res) => {
      const ids = res.data.want_lists.map((item: any) => item.product_id)
      setWantedProductIds(ids)
    })

    // Get user's reservation list to prevent duplicate reservations
    if (store.user?.id) {
      getReservationList(store.user.id)
        .then((res) => {
          console.log("Reservation list response:", res.data.reservations)
          const reservationProducts = res.data.reservations || []
          // Extract product IDs from the reservation items
          // The response shows product as [Object], so we need to access product.id
          const productIds = reservationProducts
            .map((item: any) => item.product?.id)
            .filter((id) => id !== undefined)
          setUserReservationProductIds(productIds)
          store.setOrdersCount(res.data.metadata?.total_count || 0)
        })
        .catch((err) => {
          console.error("Failed to fetch reservation list:", err)
        })
    }
  }, [])

  useEffect(() => {
    const initialize = async () => {
      await fetchReleaseDatesFromAPI()
    }
    initialize()
  }, [])

  // On latest release load, check if user has a reservation entry
  useEffect(() => {
    const checkReservation = async () => {
      if (selectedReleaseId) {
        try {
          const res = await checkReservationEntry(selectedReleaseId)
          if (res.data.exists) {
            setReservationListId(res.data.reservation_list_id)
            // Fetch products in reservation for this entry
            const prodRes = await fetchReservationProducts(
              res.data.reservation_list_id
            )
            setProductsInReservation(prodRes.data || [])
          } else {
            setReservationListId(null)
            setProductsInReservation([])
          }
        } catch (err) {
          setReservationListId(null)
          setProductsInReservation([])
        }
      } else {
        setReservationListId(null)
        setProductsInReservation([])
      }
    }
    checkReservation()
  }, [selectedReleaseId])

  useEffect(() => {
    if (releaseDates.length > 0) {
      const latest = getLatestRelease(releaseDates)
      if (latest) {
        setSelectedDate(latest.release_date)
        setSelectedReleaseId(latest.id)
        loadProductsByRelease(latest.id, 1, true)
      }
    }
  }, [releaseDates])

  // Navigate to product detail
  const navigateToProduct = (product: ProductT) => {
    getReservationList(store.user?.id).then((res) => {
      const reservationList = res.data.reservations
      // @ts-ignore
      navigation.navigate("Product", {
        product: product,
        fromReservations: true,
        reservationId: selectedReleaseId,
        reservationList,
      })
    })
  }

  // Footer component to show loading state and progress
  const renderFooter = () => {
    if (!Array.isArray(products) || products.length === 0) return null

    return {
      loading: loading || isFetchingMore,
      productCount: products.length,
      totalCount: totalCount,
    }
  }

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

    // Pagination state
    isFetchingMore,
    currentPage,
    totalPages,
    totalCount,
    hasMore,

    // UI State Setters
    setImageErrors,
    setShowSearchBar,
    setShowConfirmationModal,

    // API/Data Methods
    fetchReleaseDatesFromAPI,
    loadProductsByRelease,
    getLatestRelease,
    loadMoreProducts,
    renderFooter,

    // UI Methods
    formatDateHuman,
    toggleDrawer,
    handleSelectDate,
    clearFilters,
    isOldRelease,

    // Reservation Methods
    toggleProductSelection,
    toggleMultiSelectMode,
    showConfirmationDialog, // Only the async version is exported
    confirmReservation,
    handleCheckboxToggle,
    addToWantListHandler,
    navigateToProduct,

    // Search Methods
    handleSearchChange,
    clearSearch,
    performSearch,
  }
}
