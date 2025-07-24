import { useBoundStore } from "@/src/store"
import { StatusBar } from "expo-status-bar"
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from "react-native"
import React, { useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import {
  getWantList,
  getUserCollection,
  getOrders,
  getReservationList,
} from "@/src/api/apiEndpoints"

import { removeAuthToken } from "@/src/api/tokenManager"
import { fonts } from "@/src/theme"
import WantlistScreen from "../wantlist/WantlistScreen"
import { ErrorBoundary } from "@/src/components/ErrorBoundary"
import CollectionScreen from "../collection"

export default function Profile(props: { navigation }) {
  const store = useBoundStore()
  const theme = useBoundStore((state) => state.theme)
  const setCollectionCount = (count: number) => store.setCollectionCount(count)
  const collectionCount = store.collectionCount ?? 0

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
    getOrders(store.user.id)
      .then((res) => {
        store.setOrdersCount(res.data.length)
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err)
      })
    getWantList()
      .then((res) => {
        store.setWantlistCount(res.data.want_lists.length)
      })
      .catch(() => {
        store.setWantlistCount(0)
      })
    getUserCollection()
      .then((res) => {
        store.setCollection(res.data.series_stats)
        setCollectionCount(res.data.series.length)
        store.setSeries(
          res.data.series.sort((a, b) =>
            b.series.title.localeCompare(a.series.title)
          ) || []
        )
      })
      .catch(() => {
        setCollectionCount(0)
      })
  }, [store.user, selectedTab])

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
          <Text
            style={{
              fontFamily: "Inter",
              color: theme.text,
              fontSize: 15,
              fontWeight: "600",
            }}
          >
            {store.user?.full_name}
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
              store.setOrdersCount(0)
              store.setCollectionCount(0)
              store.setSeries([])
              store.setCollection([])
              store.setWantlistCount(0)
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
            { key: "wantlist", label: `Wantlist`, count: store.wantlistCount },
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{
            paddingHorizontal: 4,
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
                    ? theme.gray[800]
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
                {tab.count > 0 && (
                  <Text
                    style={{
                      color: selectedTab === tab.key ? "#fff" : theme.text,
                    }}
                  >
                    {tab.count}
                  </Text>
                )}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        {selectedTab === "collections" && (
          <ErrorBoundary>
            <CollectionScreen />
          </ErrorBoundary>
        )}
        {selectedTab === "wantlist" && <WantlistScreen />}
      </View>
    </SafeAreaView>
  )
}
