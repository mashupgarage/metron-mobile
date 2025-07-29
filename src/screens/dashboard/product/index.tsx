import React, { useEffect, useState } from "react"
import { Box } from "@/src/components/ui/box"
import { Text } from "@/src/components/ui/text"
import { Image } from "@/src/components/ui/image"
import { useBoundStore } from "@/src/store"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  FlatList,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native"
import { Button } from "@/src/components/ui/button"
import { useNavigation } from "@react-navigation/native"
import { ProductT } from "@/src/utils/types/common"
import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/src/components/ui/toast"
import NavigationHeader from "@/src/components/navigation-header"
import { Download, Heart, ShoppingCart, ZoomIn } from "lucide-react-native"
import * as FileSystem from "expo-file-system"
import * as MediaLibrary from "expo-media-library"
import ImageViewing from "react-native-image-viewing"
import {
  addToWantList,
  getWantList,
  addToCart,
  fetchCartItems,
  fetchProductDetails,
} from "@/src/api/apiEndpoints"

import {
  useProductSeriesStatus,
  useProductRecommendations,
} from "./productHooks"
import ProductCard from "@/src/components/rework/product-card"
import { VStack } from "@/src/components/ui/vstack"
import { fonts } from "@/src/theme"

export default function Product(props: {
  route: {
    params: {
      product: ProductT
      fromCollection?: boolean
    }
  }
}) {
  const theme = useBoundStore((state) => state.theme)
  const { route } = props
  const { params } = route
  const { product, fromCollection } = params
  const { data: seriesStatus, loading: seriesLoading } = useProductSeriesStatus(
    product.id
  )
  const { data: recommendations, loading: recsLoading } =
    useProductRecommendations(product.id)

  const [productItems, setProductItems] = useState<ProductT[]>([])
  const [quantity] = useState(1)

  // Only count available NM items for cart logic

  const maxQuantity = productItems.length
  console.log("maxQuantity", maxQuantity)
  const isQuantityValid = quantity >= 1 && quantity <= maxQuantity

  const store = useBoundStore()
  const navigation = useNavigation()
  const toast = useToast()
  const [isWanted, setIsWanted] = useState(false)
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false)
  const [, setDownloading] = useState(false)

  useEffect(() => {
    // Fetch product details to get normalized_product_items
    fetchProductDetails(product.id)
      .then((res) => {
        const details = res.data
        // Flatten all product items from normalized_product_items
        let items: unknown[] = []
        if (details.normalized_product_items) {
          Object.values(details.normalized_product_items).forEach((arr) => {
            items = items.concat(arr)
          })
        }
        setProductItems(items as ProductT[])
      })
      .catch(() => {
        setProductItems([])
      })
  }, [product.id])

  React.useEffect(() => {
    getWantList()
      .then((res) => {
        const ids = res.data.want_lists.map((item) => item.product_id)
        setIsWanted(ids.includes(product.id))
      })
      .catch(() => setIsWanted(false))
  }, [product.id])

  const handleAddToCart = async () => {
    if (!store.user || !store.user.id) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action='error'>
            <ToastTitle>You need to be logged in to add to cart.</ToastTitle>
          </Toast>
        ),
      })
      navigation.navigate("Auth" as never)
      return
    }
    if (maxQuantity === 0) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action='error'>
            <ToastTitle>Product out of stock or invalid.</ToastTitle>
          </Toast>
        ),
      })
      return
    }
    if (!isQuantityValid) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action='error'>
            <ToastTitle>
              Not enough available NM items to add to cart.
            </ToastTitle>
          </Toast>
        ),
      })
      return
    }
    try {
      // Add the first N NM product items to the cart
      for (let i = 0; i < quantity; i++) {
        await addToCart(store.user.id, product.id, productItems[i].id)
      }
      // Fetch the updated cart from backend
      const res = await fetchCartItems(store.user.id)
      if (res?.data) {
        store.setCartItems(res.data)
      }
      toast.show({
        placement: "top",
        render: ({ id }) => {
          const toastId = "toast-" + id
          return (
            <Toast nativeID={toastId} action='success'>
              <ToastTitle>Successfully added to cart!</ToastTitle>
            </Toast>
          )
        },
      })
    } catch {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action='error'>
            <ToastTitle>Failed to add to cart.</ToastTitle>
          </Toast>
        ),
      })
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 32 : 0}
      >
        <Box
          style={{
            backgroundColor: theme.background,
            height: 40,
          }}
        >
          <NavigationHeader showCartButton />
        </Box>
        <ScrollView>
          <View
            style={{
              alignItems: "center",
              marginBottom: 16,
              position: "relative",
            }}
          >
            <Image
              alt={product?.title ?? ""}
              className='w-full h-[350px]'
              source={{ uri: product?.cover_url_large ?? "" }}
            />
            <ImageViewing
              images={[{ uri: product?.cover_url_large ?? "" }]}
              imageIndex={0}
              visible={isImageViewerVisible}
              onRequestClose={() => setIsImageViewerVisible(false)}
            />
            <VStack className='absolute top-4 right-4' space='md'>
              <Box className='mb-4'>
                <Pressable
                  onPress={() => setIsImageViewerVisible(true)}
                  accessibilityLabel='Zoom image'
                  hitSlop={8}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    alignItems: "center",
                    justifyContent: "center",
                  })}
                >
                  <ZoomIn size={24} color='#fff' />
                </Pressable>
              </Box>
              <Box className='w-6'>
                <Pressable
                  onPress={async () => {
                    if (!product?.cover_url_large) return
                    setDownloading(true)
                    try {
                      const { status } =
                        await MediaLibrary.requestPermissionsAsync()
                      if (status !== "granted") {
                        toast.show({
                          placement: "top",
                          render: ({ id }) => (
                            <Toast nativeID={"toast-" + id} action='error'>
                              <ToastTitle>Permission denied</ToastTitle>
                              <ToastDescription>
                                Cannot save image without permission.
                              </ToastDescription>
                            </Toast>
                          ),
                        })
                        setDownloading(false)
                        return
                      }
                      const fileUri =
                        FileSystem.cacheDirectory +
                        (product?.title?.replace(/[^a-zA-Z0-9]/g, "_") ||
                          "image") +
                        ".jpg"
                      const downloadRes = await FileSystem.downloadAsync(
                        product.cover_url_large,
                        fileUri
                      )
                      const asset = await MediaLibrary.createAssetAsync(
                        downloadRes.uri
                      )
                      await MediaLibrary.createAlbumAsync(
                        "Download",
                        asset,
                        false
                      )
                      toast.show({
                        placement: "top",
                        render: ({ id }) => (
                          <Toast nativeID={"toast-" + id} action='success'>
                            <ToastTitle>Image saved</ToastTitle>
                            <ToastDescription>
                              Image has been saved to your gallery.
                            </ToastDescription>
                          </Toast>
                        ),
                      })
                    } catch {
                      toast.show({
                        placement: "top",
                        render: ({ id }) => (
                          <Toast nativeID={"toast-" + id} action='error'>
                            <ToastTitle>Download failed</ToastTitle>
                            <ToastDescription>
                              There was an error saving the image.
                            </ToastDescription>
                          </Toast>
                        ),
                      })
                    } finally {
                      setDownloading(false)
                    }
                  }}
                  accessibilityLabel='Download image'
                  hitSlop={8}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    alignItems: "center",
                    justifyContent: "center",
                  })}
                >
                  <Download size={24} color='#fff' />
                </Pressable>
              </Box>
            </VStack>
          </View>
          <Text
            style={[
              fonts.title,
              {
                color: theme.text,
                marginTop: theme.spacing.md,
              },
            ]}
            className='px-4 mt-6 mb-2'
          >
            {product?.title}
          </Text>
          {product?.creators && (
            <Text className='px-4 mb-2' style={{ color: theme.text }}>
              {product?.creators}
            </Text>
          )}
          <Text className='px-4 mb-2' style={{ color: theme.text }}>
            {product?.publisher}
          </Text>
          <View className='px-4 mt-4 mb-2'>
            <Text
              className='mt-2'
              style={{
                color: theme.text,
              }}
            >
              {product?.description ?? ""}
            </Text>

            {/* if from collection we hide the stats */}
            {/* Hide collection status, series progress, and recommendations if fromDetailedDisplay */}
            {!fromCollection && (
              <VStack>
                {/* Collection Status */}
                <Text
                  style={[
                    fonts.label,
                    {
                      marginTop: theme.spacing.md,
                      color: theme.text,
                    },
                  ]}
                >
                  Your Collection Status
                </Text>
                {/* Series Status (Collection Progress) */}
                <View
                  style={[
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: theme.spacing.md,
                    },
                  ]}
                >
                  {seriesLoading ? (
                    <Text
                      style={[
                        fonts.body,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      Loading...
                    </Text>
                  ) : seriesStatus ? (
                    <>
                      <Text
                        style={[
                          fonts.body,
                          {
                            marginTop: theme.spacing.sm,
                            color: theme.text,
                          },
                        ]}
                      >
                        {seriesStatus?.related_series?.collected ?? 0} of{" "}
                        {seriesStatus?.related_series?.total === 0
                          ? 1
                          : seriesStatus?.related_series?.total}{" "}
                        Series Collected
                      </Text>
                      <Text
                        style={[
                          fonts.body,
                          {
                            marginTop: theme.spacing.sm,
                            color: theme.text,
                          },
                        ]}
                      >
                        {(() => {
                          const collected = Number(
                            seriesStatus?.related_series?.collected ?? 0
                          )
                          let total = Number(
                            seriesStatus?.related_series?.total ?? 1
                          )
                          if (!total) total = 1
                          return ((collected / total) * 100).toFixed(0)
                        })()}
                        % Complete
                      </Text>
                    </>
                  ) : (
                    <Text
                      style={[
                        fonts.body,
                        { color: theme.text, marginTop: theme.spacing.md },
                      ]}
                    >
                      No series data
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    height: 8,
                    backgroundColor: theme.border,
                    borderRadius: 4,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <View
                    style={{
                      width: seriesStatus
                        ? `${seriesStatus.completion_percent ?? 0}%`
                        : "0%",
                      height: 8,
                      backgroundColor: theme.primary[500],
                      borderRadius: 4,
                    }}
                  />
                </View>
                <Text
                  style={[
                    fonts.label,
                    {
                      color: theme.text,
                      marginTop: theme.spacing.md,
                      marginBottom: theme.spacing.md,
                    },
                  ]}
                >
                  You may also like
                </Text>
                <FlatList
                  data={recommendations?.recommendations || []}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, idx) => `${item.id}_${idx}`}
                  renderItem={({ item }) => (
                    <Box
                      style={{
                        maxWidth: Dimensions.get("window").width / 3,
                        marginRight: theme.spacing.md,
                      }}
                    >
                      <ProductCard grid product={item} />
                    </Box>
                  )}
                  ListEmptyComponent={() =>
                    recsLoading ? (
                      <Text style={fonts.body}>Loading...</Text>
                    ) : (
                      <Text style={fonts.body}>No recommendations</Text>
                    )
                  }
                  style={{ marginBottom: theme.spacing.md }}
                />
              </VStack>
            )}
          </View>
        </ScrollView>
        {/* Bottom Bar */}
        <View
          style={{
            flexDirection: "row",
            padding: theme.spacing.md,
            backgroundColor: theme.background,

            borderColor: theme.border,
            alignItems: "center",
            gap: theme.spacing.md,
          }}
        >
          {/* Want List Button */}
          <Pressable
            onPress={async () => {
              if (store.user !== null) {
                try {
                  await addToWantList(product.id)
                  setIsWanted(true)
                  toast.show({
                    placement: "top",
                    render: ({ id }) => {
                      const toastId = "toast-" + id
                      return (
                        <Toast nativeID={toastId} action='success'>
                          <ToastTitle>Product added to want list!</ToastTitle>
                        </Toast>
                      )
                    },
                  })
                } catch {
                  toast.show({
                    placement: "top",
                    render: ({ id }) => {
                      const toastId = "toast-" + id
                      return (
                        <Toast nativeID={toastId} action='error'>
                          <ToastTitle>Failed to add to want list.</ToastTitle>
                        </Toast>
                      )
                    },
                  })
                }
              }
            }}
            disabled={isWanted}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              paddingHorizontal: theme.spacing.md,
              borderColor: theme.primary[500],
              borderRadius: 24,
              backgroundColor: isWanted ? "transparent" : theme.background,
              paddingVertical: theme.spacing.md,
              opacity: isWanted ? 0.6 : 1,
            }}
          >
            {/* Heart icon from lucide-react-native */}
            <Heart
              stroke={isWanted ? theme.error : theme.primary[500]}
              fill={isWanted ? theme.error : "transparent"}
              color={theme.text}
              size={24}
            />
          </Pressable>

          {/* Add to Cart Button */}
          <Button
            action='primary'
            style={{
              backgroundColor: theme.primary[500],
              width: "80%",
            }}
            className='rounded-full h-16 flex-row items-center gap-2'
            onPress={async () => handleAddToCart()}
          >
            <ShoppingCart color={theme.white} size={24} />
            <Text
              style={[
                {
                  color: theme.white,
                  fontSize: theme.fonts.label.fontSize,
                  fontWeight: "bold",
                },
              ]}
            >
              {product?.formatted_price ??
                "PHP " + Number(product?.price).toFixed(2)}
            </Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
