import { FC, useState } from "react"
import { Pressable, View } from "react-native"
import { addToWantList } from "@/src/api/apiEndpoints"
import { useBoundStore } from "@/src/store"
import { StarIcon } from "lucide-react-native"
import ImageViewing from "react-native-image-viewing"
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native"
import { fonts } from "@/src/theme"
import ProductCard from "../rework/product-card"
import { ProductT } from "@/src/utils/types/common"
import { Text } from "../ui/text"

interface SeriesCardProps {
  data: {
    series_id: number
    series: {
      id: number
      title: string
    }
    count: number
    publisher: string
    last_product: {
      id: number
      title: string
      image_url: string
    }
    owned_products: number
    unowned_products: number
    cover_url_large?: string
    product_items_count?: number
    in_want_list?: boolean
  }
  grayed?: boolean
}

const SeriesCard: FC<SeriesCardProps> = ({ data, grayed }) => {
  const theme = useBoundStore((state) => state.theme)
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false)


  if (!data || !data.series) return null

  const mainImage = data.last_product?.image_url || data.cover_url_large || undefined

  // Transform series data to ProductT format for ProductCard
  const transformedProduct: ProductT = {
    id: data.series.id,
    title: data.series.title,
    cover_price: "",
    price: "",
    quantity: null,
    featured: false,
    hidden: false,
    description: "",
    creators: "",
    series: {
      id: data.series.id,
      title: data.series.title,
      slug: "",
      publisher_id: 0,
      category_id: 0,
    },
    slug: "",
    isbn: null,
    upc: "",
    publisher_id: 0,
    category_id: 0,
    series_id: data.series.id,
    issue_number: "",
    year: null,
    cover_url: mainImage || "",
    cover_url_large: data.cover_url_large || "",
    formatted_price: "",
    publisher: data.publisher || "",
    publisher_name: data.publisher || "",
    category_name: "",
    meta_attributes: {
      owned_products: data.owned_products,
      unowned_products: data.unowned_products,
    },
  }
  const handleAddToWantList = async () => {
    try {
      await addToWantList(data.series.id)
      // TODO: Add toast notification for success
    } catch {
      // TODO: Add toast notification for error
      console.error('Failed to add to Want List')
    }
  }

  const handleAddToCart = async (item) => {
    try {
      navigation.navigate("Product", {
        product: item,
        fromCollection: true,
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Pressable onLongPress={() => setIsImageViewerVisible(true)} onPress={() => navigation.navigate("Product", { product: data })}>
        <ProductCard
          product={transformedProduct}
          hasPreview={true}
          grid={true}
      >
        {/* Collection status badge */}
        {grayed && (
          <View
            style={{
              position: "absolute",
              top: 16,
              left: 4,
              zIndex: 10,
              backgroundColor: theme.gray[800],
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
            pointerEvents='none'
          >
            <Text
              style={[
                fonts.caption,
                {
                  color: theme.white,
                  fontWeight: "bold",
                  fontSize: 12,
                },
              ]}
            >
              Not Owned
            </Text>
          </View>
        )}
      </ProductCard>
      
      {/* Image viewer modal */}
      <ImageViewing
        images={[{ uri: mainImage }]}
        imageIndex={0}
        visible={isImageViewerVisible}
        onRequestClose={() => setIsImageViewerVisible(false)}
        />
        </Pressable>
    </>
  )
}

export default SeriesCard
