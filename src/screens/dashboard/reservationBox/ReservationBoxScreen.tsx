import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native"
import { useBoundStore } from "@/src/store"
import { getReservationList } from "@/src/api/apiEndpoints"
import { ProductT, ReservationItemT } from "@/src/utils/types/common"
import { useNavigation } from "@react-navigation/native"
import { ProductListing } from "@/src/components/product-listing"
import { fonts } from "@/src/theme"

const PAGE_SIZE = 50

interface ExtendedReservationItemT extends Omit<ReservationItemT, "product"> {
  product?: {
    id: number
    title: string
    cover_price?: string
    price?: string
    formatted_price?: string
    creators?: string
    cover_file_name?: string
    cover_content_type?: string
    cover_file_size?: number
    cover_updated_at?: string
    description?: string
    issue_number?: string
    quantity?: number
    cover_url?: string
    publisher?: string
  }
}

export default function ReservationBoxScreen() {
  const [isGrid, setIsGrid] = useState(true)
  const theme = useBoundStore((state) => state.theme)
  const store = useBoundStore()
  const navigation = useNavigation()
  const [reservations, setReservations] = useState<ExtendedReservationItemT[]>(
    []
  )
  const [, setLoading] = useState(true)
  const [, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 1500)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Centralized color palette for light/dark mode
  const colors = {
    background: theme.background,
    surface: theme.surface,
    text: theme.text,
    textSecondary: theme.white,
    border: theme.border,
    placeholder: theme.white,
    primary: theme.primary,
    error: theme.error,
    cardShadow: theme.gray[900],
    icon: theme.text,
  }

  // Initial load
  useEffect(() => {
    if (!store.user) {
      // @ts-expect-error navigation.replace
      navigation.replace("Auth", { screen: "SignIn" })
      return
    }
    setLoading(true)
    getReservationList(store.user.id, 1, PAGE_SIZE, debouncedQuery)
      .then((res) => {
        const reservationData = res.data.reservations.filter(
          (item) => item.status !== "fill"
        )
        setReservations(reservationData)
        setPage(1)
        setTotalPages(res.data.metadata?.total_pages || 1)
        setTotalCount(res.data.metadata?.total_count)
        setError(null)
      })
      .catch((err) => {
        console.error("Failed to fetch reservations:", err)
        setError("Failed to load your reservations. Please try again later.")
        setReservations([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [store.user, navigation, debouncedQuery])

  // Transform reservations to product listing data with overlays
  const products = reservations
    .filter((reservation) => reservation.product)
    .map((reservation) => {
      const product: ProductT & { reservationStatus: string } = {
        ...(reservation.product as ProductT),
        cover_url:
          typeof reservation.product?.cover_url === "string" && reservation.product.cover_url.trim() !== ""
            ? reservation.product.cover_url
            : reservation.product?.cover_file_name
            ? `https://assets.comic-odyssey.com/products/covers/medium/${reservation.product.cover_file_name}`
            : "",
        reservationStatus: reservation.status,
      }
      return {
        ...product,
        reservationStatus: reservation.status,
        isReserved: reservation.status === "reserved",
        // Optionally: add reservationId for key
        reservationId: reservation.id,
      }
    })

  return (
    <>
      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16 }}>
        <View style={{ position: "relative" }}>
          <TextInput
            placeholder='Search by title...'
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
            placeholderTextColor={theme.textSecondary}
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
              accessibilityLabel='Clear search'
            >
              <Text style={[fonts.body, { color: colors.textSecondary }]}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={{ height: "100%" }}>
        <ProductListing
          title="Reservations"
          products={products}
          showReservationStatus={true}
          showPadding={true}
          loading={isFetchingMore && page < totalPages} 
        />
      </View>
      <View style={{ alignItems: "center", marginVertical: 24 }}>
        <Text style={[fonts.caption, { color: colors.textSecondary }]}>
          Showing {Math.min(reservations.length, totalCount)} of {totalCount}{" "}
          reserved items
        </Text>
      </View>
    </>
  )
}
