import { Linking, Pressable, Text, View } from "react-native"
import { useBoundStore } from "@/src/store"
import { useEffect, useState } from "react"
import MasonryList from "@react-native-seoul/masonry-list"
import { getOrders } from "@/src/api/apiEndpoints"
import { Box } from "@/src/components/ui/box"
import { fonts } from "@/src/theme"

const OrdersScreen = () => {
  const theme = useBoundStore((state) => state.theme)
  const user = useBoundStore((state) => state.user)
  const store = useBoundStore((state) => state)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const fetchOrders = async (userId: number) => {
      try {
        const response = await getOrders(userId)
        setOrders(response.data)
        store.setOrdersCount(response.data.length)
      } catch (error) {
        console.error("Error fetching orders:", error)
      }
    }
    fetchOrders(user.id)
  }, [])

  const statusColors: Record<string, string> = {
    pending_store_delivery: theme.warning[500] || "#FFA500",
    approved: theme.primary[500] || "#007AFF",
    fulfilled: theme.success[500] || "#4CAF50",
    default: theme.text,
  }

  const renderItem = ({ item }: { item: any }) => {
    function getPaymentStatus(order) {
      // Example mapping, adjust as needed
      if (order.status === "fulfilled") return "Paid"
      if (order.status === "approved") return "Pay Online or Bank Deposit"
      if (order.status === "pending_store_delivery") return "Pending"
      return "-"
    }
    const statusColor = statusColors[item.status] || statusColors.default
    return (
      <Pressable
        onPress={() => {
          Linking.openURL(`https://comic-odyssey.com/orders/${item.id}`)
        }}
        // onPress={() => navigation.navigate("OrderDetails", { order: item })}
      >
        <View style={{ margin: theme.spacing.md }}>
          <View
            key={item.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              height: 48,
              borderBottomWidth: 1,
              borderColor: theme.background2,
            }}
          >
            <Text
              style={[
                fonts.label,
                {
                  flex: 1,
                  color: theme.primary[500],
                  textDecorationLine: "underline",
                  textAlignVertical: "center",
                  textAlign: "left",
                },
              ]}
              numberOfLines={1}
              ellipsizeMode='tail'
            >
              #{item.id}
            </Text>
            <Text
              style={[
                fonts.body,
                {
                  flex: 2,
                  color: theme.text,
                  textAlignVertical: "center",
                  textAlign: "left",
                },
              ]}
              numberOfLines={1}
              ellipsizeMode='tail'
            >
              {item.formatted_status}
            </Text>
            <Text
              style={[
                fonts.body,
                {
                  flex: 1,
                  color: statusColor,
                  textAlignVertical: "center",
                  textAlign: "left",
                },
              ]}
              numberOfLines={1}
              ellipsizeMode='tail'
            >
              {getPaymentStatus(item)}
            </Text>
          </View>
        </View>
      </Pressable>
    )
  }

  return (
    <>
      <Text
        style={[
          fonts.title,
          {
            color: theme.text,
            marginHorizontal: theme.spacing.md,
          },
        ]}
      >
        My Orders
      </Text>
      <Text
        style={[
          fonts.body,
          {
            color: theme.text,
            marginVertical: theme.spacing.md,
            marginHorizontal: theme.spacing.md,
          },
        ]}
      >
        This is a list of all your orders, track orders, pay, and manage your
        orders here.
      </Text>
      <Box
        className='h-screen w-full pb-24'
        style={{
          marginTop: theme.spacing.md,
          backgroundColor: theme.background,
        }}
      >
        <MasonryList
          data={orders}
          scrollEnabled={true}
          ListHeaderComponent={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                height: 48,
                borderBottomWidth: 1,
                marginHorizontal: theme.spacing.md,
                borderColor: theme.background2,
                marginBottom: 8,
              }}
            >
              <Text
                style={[
                  fonts.label,
                  {
                    flex: 1,
                    color: theme.text,
                    textAlignVertical: "center",
                    textAlign: "left",
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                Order ID
              </Text>
              <Text
                style={[
                  fonts.label,
                  {
                    flex: 2,
                    color: theme.text,
                    textAlignVertical: "center",
                    textAlign: "left",
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                Order Status
              </Text>
              <Text
                style={[
                  fonts.label,
                  {
                    flex: 1,
                    color: theme.text,
                    textAlignVertical: "center",
                    textAlign: "left",
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                Status
              </Text>
            </View>
          }
          numColumns={1}
          renderItem={renderItem}
        />
      </Box>
    </>
  )
}

export default OrdersScreen
