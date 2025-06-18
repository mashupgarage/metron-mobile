import { Linking, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useBoundStore } from "@/src/store"
import NavigationHeader from "@/src/components/navigation-header"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import MasonryList from "@react-native-seoul/masonry-list"
import { getOrders } from "@/src/api/apiEndpoints"
import { Box } from "@/src/components/ui/box"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { DashboardStackParams } from "@/src/utils/types/navigation"

const OrdersScreen = () => {
  const navigation = useNavigation<NavigationProp<DashboardStackParams>>()
  const theme = useBoundStore((state) => state.theme)
  const store = useBoundStore((state) => state.isDark)
  const user = useBoundStore((state) => state.user)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const fetchOrders = async (userId: number) => {
      try {
        const response = await getOrders(userId)
        setOrders(response.data)
        console.log(response.data)
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
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text
              style={{
                flex: 1.2,
                color: theme.primary[500],
                textDecorationLine: "underline",
              }}
            >
              {item.id}
            </Text>
            <Text style={{ flex: 2, color: theme.text }}>
              {item.formatted_status}
            </Text>
            <Text style={{ flex: 1.5, color: statusColor, fontWeight: "bold" }}>
              {getPaymentStatus(item)}
            </Text>
          </View>
        </View>
      </Pressable>
    )
  }

  return (
    <SafeAreaView>
      <NavigationHeader />
      <StatusBar style={store ? "light" : "dark"} />
      <Text
        style={{
          fontSize: 24,
          paddingLeft: theme.spacing.md,
          paddingRight: theme.spacing.md,
          marginTop: theme.spacing.xl,
          fontWeight: "bold",
          fontFamily: "Inter",
          color: theme.text,
        }}
      >
        My Orders
      </Text>
      <Text
        style={{
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          fontFamily: "Inter",
          color: theme.text,
        }}
      >
        This is a list of all your orders, track orders, pay, and manage your
        orders here.
      </Text>
      <Box
        className='h-screen w-full pb-24'
        style={{
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
                borderBottomWidth: 1,
                marginHorizontal: theme.spacing.md,
                borderColor: theme.border,
                paddingBottom: 8,
                marginBottom: 8,
              }}
            >
              <Text
                style={{ flex: 1.2, fontWeight: "bold", color: theme.text }}
              >
                Order ID
              </Text>
              <Text
                style={{ flex: 1.5, fontWeight: "bold", color: theme.text }}
              >
                Order Status
              </Text>
              <Text
                style={{ flex: 1.5, fontWeight: "bold", color: theme.text }}
              >
                Payment Status
              </Text>
            </View>
          }
          numColumns={1}
          renderItem={renderItem}
        />
      </Box>
    </SafeAreaView>
  )
}

export default OrdersScreen
