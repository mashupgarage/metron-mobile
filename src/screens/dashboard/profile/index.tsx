import { useBoundStore } from "@/src/store"
import { StatusBar } from "expo-status-bar"
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from "react-native"
import React, { useEffect, useState } from "react"
import { useWantListStore } from "@/src/store/slices/WantListSlice"
import { Ionicons } from "@expo/vector-icons"
import {
  getWantList,
  getUserCollection,
  getReservationList,
} from "@/src/api/apiEndpoints"

import { removeAuthToken } from "@/src/api/tokenManager"
import CollectionScreen from "@/src/screens/dashboard/collection"
import OrdersScreen from "../orders/OrdersScreen"
import WantlistScreen from "../wantlist/WantlistScreen"
import { fonts } from "@/src/theme"
import ReservationBoxScreen from "../reservationBox/ReservationBoxScreen"

export default function Profile(props: { navigation: any }) {
  const store = useBoundStore()
  const theme = useBoundStore((state) => state.theme)
  const wantlistCount = useWantListStore((state) => state.wantlistCount)
  const setWantlistCount = useWantListStore((state) => state.setWantlistCount)
  const setCollectionCount = (count: number) => store.setCollectionCount(count)
  const collectionCount = store.collectionCount ?? 0
  const [reservationCount, setReservationCount] = useState(0)

  const [checkingUser, setCheckingUser] = useState(true)
  const [selectedTab, setSelectedTab] = useState("collections")

  useEffect(() => {
    // Stall and check user existence
    if (!store.user) {
      setCheckingUser(true)
      setTimeout(() => {
        props.navigation.replace("Auth", { screen: "SignIn" })
      }, 300) // Small delay for loader effect
      return
    }
    setCheckingUser(false)
    getReservationList(store.user.id, 1, 50)
      .then((res) => {
        console.log("reservations", res.data)
        setReservationCount(res.data.metadata?.total_count)
      })
      .catch(() => {
        console.log("Failed to fetch reservations")
      })
    getWantList()
      .then((res) => {
        setWantlistCount(res.data.want_lists.length)
      })
      .catch(() => {
        setWantlistCount(0)
      })

    getUserCollection()
      .then((res) => {
        setCollectionCount(res.data.series.length)
      })
      .catch(() => {
        setCollectionCount(0)
      })
  }, [store.user, props.navigation])

  if (checkingUser) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView
      style={{
        paddingTop: 24,
        backgroundColor: theme.background,
      }}
      className={"flex-1"}
    >
      <StatusBar style={store.isDark ? "light" : "dark"} />
      {/* Topbar with avatar, email, settings, and logout */}
      <View
        style={{
          borderColor: theme.background2,
          borderBottomWidth: 1,
          paddingVertical: 16,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.background,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={{ uri: "https://picsum.photos/100" }}
            style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }}
          />
          <Text
            style={{
              fontFamily: "Inter",
              color: theme.text,
              fontSize: 15,
              fontWeight: "500",
            }}
          >
            {store.user?.email}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => props.navigation.navigate("EditProfile")}
            style={{ marginRight: 18 }}
          >
            <Ionicons name='settings-outline' size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              removeAuthToken()
              store.setOnboardingDone(true)
              store.setCartItems([])
              store.setCartCount(0)
              store.setCollectionCount(0)
              store.setUser(null)
            }}
          >
            <Ionicons name='log-out-outline' size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pill-shaped Tabs */}
      <View className='p-4 '>
        <FlatList
          data={[
            {
              key: "collections",
              label: `Collections`,
              count: collectionCount,
            },

            {
              key: "reservations",
              label: `Reservations`,
              count: reservationCount,
            },
            { key: "wantlist", label: `Wantlist`, count: wantlistCount },
            { key: "orders", label: `Orders`, count: store.ordersCount ?? 0 },
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 8,
            backgroundColor: theme.background,
          }}
          renderItem={({ item: tab }) => (
            <TouchableOpacity
              key={tab.key}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 18,
                marginRight: 8,
                backgroundColor:
                  selectedTab === tab.key
                    ? theme.primary[500]
                    : theme.background2,
              }}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text
                style={{
                  ...fonts.body,
                  color: selectedTab === tab.key ? "#fff" : theme.text,
                  fontWeight: selectedTab === tab.key ? "bold" : "500",
                }}
              >
                {tab.label}{" "}
                <Text style={{ color: theme.text, ...fonts.label }}>
                  {tab.count}
                </Text>
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        {selectedTab === "collections" && <CollectionScreen />}
        {selectedTab === "reservations" && <ReservationBoxScreen />}
        {selectedTab === "wantlist" && <WantlistScreen />}
        {selectedTab === "orders" && <OrdersScreen />}
      </View>
    </SafeAreaView>
  )
}
