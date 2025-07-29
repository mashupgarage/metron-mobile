import React, { useState, useEffect } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { Text, ActivityIndicator, Dimensions } from "react-native"
import { Box } from "@/src/components/ui/box"
import { useBoundStore } from "@/src/store"
import SeriesCard from "@/src/components/series"
import NavigationHeader from "@/src/components/navigation-header"
import { getCollectionSeriesStatus } from "@/src/api/apiEndpoints"
import { useRoute } from "@react-navigation/native"
import { getWantList } from "@/src/api/apiEndpoints"
import { HStack } from "@/src/components/ui/hstack"
import MasonryList from "@react-native-seoul/masonry-list"
import { ProductT } from "@/src/utils/types/common"
import { fonts } from "@/src/theme"

const DetailedCollectionScreen = () => {
  const [wantList, setWantList] = useState<number[]>([])
  const deviceWidth = Dimensions.get("window").width

  const theme = useBoundStore((state) => state.theme)
  const route = useRoute()
  const [total_owned, setTotalOwned] = useState<number>(0)
  const [total_products, setTotalProducts] = useState<number>(0)
  const [collection, setCollection] = useState<any[]>([])
  const [owned, setOwned] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")

  // Fetch collection from API
  useEffect(() => {
    setLoading(true)
    // Fetch want list
    getWantList()
      .then((res) => {
        setWantList(res.data.want_lists.map((item: any) => item.id))
      })
      .catch(() => setWantList([]))

    // @ts-ignore
    const seriesId = route.params?.seriesId
    if (!seriesId) {
      setLoading(false)
      return
    }
    getCollectionSeriesStatus(seriesId)
      .then((res) => {
        setCollection(res.data.series.products)
        setOwned(res.data.series.products_owned)
        setTotalOwned(res.data.series.owned)
        setTotalProducts(res.data.series.total)
        setTitle(res.data.series.title)
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => setLoading(false))
  }, [])
  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size='large' color={theme.primary[500]} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      {/* Header */}
      <NavigationHeader />
      <HStack className='flex-row items-center justify-between px-4 mt-8 mb-4'>
        <Text
          numberOfLines={3}
          ellipsizeMode='tail'
          style={[
            fonts.title,
            {
              color: theme.text,
              maxWidth: "60%",
              marginLeft: theme.spacing.xs,
              fontWeight: "bold",
            },
          ]}
        >
          {title || ""}
        </Text>

        <Text
          numberOfLines={2}
          style={[
            fonts.body,
            {
              color: theme.text,
              marginRight: theme.spacing.xs,
            },
          ]}
        >
          {total_owned ?? 0} of {total_products ?? 0}
        </Text>
      </HStack>
      <MasonryList
        data={[...collection].sort((a, b) => a.title.localeCompare(b.title))}
        numColumns={deviceWidth > 325 ? 3 : 2}
        scrollEnabled
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{}}
        style={{
          columnGap: 12,
          marginHorizontal: 12,
        }}
        renderItem={({
          item,
          i,
        }: {
          item: ProductT & {
            count: number
            owned_products: number
            unowned_products: number
            image_url: string
            product_items_count: number
          }
          i: number
        }) => {
          // grey out products you dont own yet.
          const grayed = !owned.includes(item.id)
          const transformed = {
            series_id: item.id,
            series: {
              id: item.id,
              title: item.title,
            },
            count: item.count,
            publisher: item.publisher,
            last_product: {
              id: item.id,
              title: item.title,
              image_url: item.image_url,
            },
            description: item.description,
            creators: item.creators,
            owned_products: item.owned_products,
            unowned_products: item.unowned_products,
            cover_url_large: item.cover_url_large,
            product_items_count: item.product_items_count,
            in_want_list: !wantList.includes(item.id),
            ...item,
          }
          console.log(transformed.description)

          return (
            // @ts-ignore
            <Box key={i} className='items-center'>
              <SeriesCard data={transformed} grayed={grayed} />
            </Box>
          )
        }}
      />
    </SafeAreaView>
  )
}

export default DetailedCollectionScreen
