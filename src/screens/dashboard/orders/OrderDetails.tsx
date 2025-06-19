import { SafeAreaView, View, Text, Image } from "react-native"
import { StatusBar } from "expo-status-bar"
import NavigationHeader from "@/src/components/navigation-header"
import { useBoundStore } from "@/src/store"
import { useRoute } from "@react-navigation/native"

const OrderDetails = () => {
  const route = useRoute()
  // @ts-ignore
  const { order } = route.params
  const store = useBoundStore((state) => state.isDark)
  const theme = useBoundStore((state) => state.theme)

  const orderDetails = order
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
        Order Details
      </Text>
      {/* Order Meta Info */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          marginTop: theme.spacing.md,
        }}
      >
        <View style={{ flex: 1, minWidth: "50%" }}>
          <Text style={{ color: theme.text, marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>Ordered:</Text>{" "}
            {orderDetails.created_at
              ? new Date(orderDetails.created_at).toLocaleDateString()
              : "-"}
          </Text>
          <Text style={{ color: theme.text, marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>Branch:</Text>{" "}
            {orderDetails.branch}
          </Text>
          <Text style={{ color: theme.text, marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>Payment Status:</Text> Payment{" "}
            {order.status === "approved"
              ? "Pending"
              : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            .
          </Text>
          <Text style={{ color: theme.text, marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>Notes:</Text>{" "}
            {order.notes || "-"}
          </Text>
        </View>
        <View style={{ flex: 1, minWidth: "50%" }}>
          <Text style={{ color: theme.text, marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>Contact Number:</Text>{" "}
            {order.contact_number || "-"}
          </Text>
          <Text style={{ color: theme.text, marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>Fulfillment Status:</Text>{" "}
            {order.formatted_status || "-"}
          </Text>
          <Text style={{ color: theme.text, marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>Tracking Details:</Text>{" "}
            {order.tracking_details || "-"}
          </Text>
          <Text style={{ color: theme.text, marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>Payment Method:</Text>{" "}
            {order.payment_method || "-"}
          </Text>
        </View>
      </View>

      {/* Bank Deposit Instructions */}
      {order.payment_method &&
        order.payment_method.toLowerCase().includes("bank") && (
          <View
            style={{
              marginTop: theme.spacing.lg,
              marginBottom: theme.spacing.md,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 16,
                color: theme.text,
                marginBottom: 4,
              }}
            >
              Instructions to pay via bank
            </Text>
            <Text style={{ color: theme.text, marginBottom: 8 }}>
              Deposit the total order amount to any of these bank accounts near
              you then upload a picture of the deposit slip with the form below,
              using the following details:
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: theme.spacing.md,
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontWeight: "bold", color: theme.text }}>
                  Bank: BPI
                </Text>
                <Text style={{ color: theme.text }}>
                  Account Name: Comic Odyssey, Inc.
                </Text>
                <Text style={{ color: theme.text }}>
                  Account Number: 2601-0259-41
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "bold", color: theme.text }}>
                  Bank: BDO
                </Text>
                <Text style={{ color: theme.text }}>
                  Account Name: Ma. Rowena Sansolis
                </Text>
                <Text style={{ color: theme.text }}>
                  Account Number: 0034-1802-0926
                </Text>
              </View>
            </View>
            <Text
              style={{ fontWeight: "bold", color: theme.text, marginBottom: 4 }}
            >
              Upload a bank deposit slip
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: theme.spacing.md,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, marginBottom: 2 }}>
                  Bank name
                </Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 6,
                    padding: 8,
                  }}
                >
                  <Text style={{ color: theme.text, opacity: 0.6 }}>
                    Choose a bank outlet
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ color: theme.text, marginBottom: 2 }}>
                  Deposit slip
                </Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 6,
                    padding: 8,
                  }}
                >
                  <Text style={{ color: theme.text, opacity: 0.6 }}>
                    Choose File (placeholder)
                  </Text>
                </View>
              </View>
              <View style={{ marginLeft: 8 }}>
                <View
                  style={{
                    backgroundColor: theme.primary[500],
                    borderRadius: 6,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Submit
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

      {/* Order Items Table */}
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 16,
          color: theme.text,
          marginTop: theme.spacing.lg,
          marginBottom: 8,
        }}
      >
        Your Items
      </Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* Header Row */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: theme.background2,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              flex: 2,
              fontWeight: "bold",
              color: theme.text,
              paddingLeft: 8,
            }}
          >
            Product
          </Text>
          <Text
            style={{
              flex: 1,
              fontWeight: "bold",
              color: theme.text,
              textAlign: "center",
            }}
          >
            Quantity
          </Text>
          <Text
            style={{
              flex: 1,
              fontWeight: "bold",
              color: theme.text,
              textAlign: "right",
              paddingRight: 8,
            }}
          >
            Price
          </Text>
        </View>
        {/* Items */}
        {order.items &&
          order.items.map((item, idx) => (
            <View
              key={item.id || idx}
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: idx === order.items.length - 1 ? 0 : 1,
                borderColor: theme.border,
                paddingVertical: 8,
              }}
            >
              <View
                style={{
                  flex: 2,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingLeft: 8,
                }}
              >
                {item.image_url && (
                  <Image
                    source={{ uri: item.image_url }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 4,
                      marginRight: 8,
                    }}
                  />
                )}
                <Text
                  style={{
                    color: theme.primary[500],
                    textDecorationLine: "underline",
                  }}
                >
                  {item.title}
                </Text>
              </View>
              <Text style={{ flex: 1, color: theme.text, textAlign: "center" }}>
                {item.quantity}
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: theme.text,
                  textAlign: "right",
                  paddingRight: 8,
                }}
              >
                ₱{Number(item.price).toFixed(2)}
              </Text>
            </View>
          ))}
        {/* Shipping Fee Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
            borderTopWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text style={{ flex: 2, color: theme.text, paddingLeft: 8 }}>
            Shipping Fee
          </Text>
          <Text style={{ flex: 1 }}></Text>
          <Text
            style={{
              flex: 1,
              color: theme.text,
              textAlign: "right",
              paddingRight: 8,
            }}
          >
            {order.shipping_total && Number(order.shipping_total) > 0
              ? `₱${Number(order.shipping_total).toFixed(2)}`
              : "Free Shipping"}
          </Text>
        </View>
      </View>
      {/* Total Price Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginTop: 8,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 18, color: theme.text }}>
          Total Price ₱{Number(order.total_price).toFixed(2)}
        </Text>
      </View>
    </SafeAreaView>
  )
}

export default OrderDetails
