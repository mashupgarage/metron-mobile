import { useBoundStore } from "@/src/store"
import { StatusBar } from "expo-status-bar"
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  useColorScheme,
} from "react-native"
import { useEffect, useState } from "react"
import { useWantListStore } from "@/src/store/slices/WantListSlice"
import { Ionicons } from "@expo/vector-icons"
import { getWantList, getUserCollection } from "@/src/api/apiEndpoints"

import { removeAuthToken } from "@/src/api/tokenManager"

export default function Profile(props: { navigation: any }) {
  const store = useBoundStore()
  const theme = useBoundStore((state) => state.theme)
  const colorScheme = useColorScheme()
  const wantlistCount = useWantListStore((state) => state.wantlistCount)
  const setWantlistCount = useWantListStore((state) => state.setWantlistCount)
  const setCollectionCount = (count: number) => store.setCollectionCount(count)
  const collectionCount = store.collectionCount ?? 0

  const [checkingUser, setCheckingUser] = useState(true)

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
    // Fetch wantlist count on mount
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

  const handleEditProfile = () => {
    props.navigation.navigate("EditProfile")
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
        style={{ borderColor: theme.border, borderBottomWidth: 1 }}
        className={`flex-row items-center justify-between py-4 px-5`}
      >
        {/* <Text className="text-xl font-semibold">Profile</Text> */}
        <View />
        <TouchableOpacity onPress={handleEditProfile}>
          <Text
            style={{
              fontFamily: "PublicSans-regular",
              color: theme.text,
              fontSize: 16,
            }}
            className='font-semibold text-primary-600'
          >
            Edit
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className='flex-1 pb-32'>
        <View className='items-center py-6'>
          <Image
            source={{ uri: "https://picsum.photos/200" }}
            className='w-24 h-24 rounded-full mb-3'
          />
          <Text
            style={{ fontFamily: "Urbanist-Bold", color: theme.text }}
            className={`text-xl font-bold mb-1`}
          >
            {store.user?.full_name}
          </Text>
          <Text
            style={{ fontFamily: "PublicSans-regular", color: theme.text }}
            className={`text-base`}
          >
            {store.user?.email}
          </Text>
        </View>

        <View
          style={{ borderColor: theme.border }}
          className={`flex-row justify-around py-5 border-y mx-4`}
        >
          {/* <View className="items-center">
            <Text
              className={`text-2xl font-bold ${
                colorScheme === "dark" ? "text-mdark-text" : "text-gray-900"
              }`}
            >
              {ordersCount}
            </Text>
            <Text
              className={`text-base ${
                colorScheme === "dark"
                  ? "text-mdark-textSecondary"
                  : "text-gray-500"
              }`}
            >
              Orders
            </Text>
          </View> */}
          <View className='items-center'>
            <Text
              style={{ fontFamily: "Urbanist-Bold", color: theme.text }}
              className={`text-2xl font-bold`}
            >
              {collectionCount}
            </Text>
            <Text
              style={{ fontFamily: "PublicSans-regular", color: theme.text }}
              className={`text-base`}
            >
              Series Collections
            </Text>
          </View>
          <View className='items-center'>
            <Text
              style={{ fontFamily: "Urbanist-Bold", color: theme.text }}
              className={`text-2xl font-bold`}
            >
              {wantlistCount}
            </Text>
            <Text
              style={{ fontFamily: "PublicSans-regular", color: theme.text }}
              className={`text-base`}
            >
              Wantlist
            </Text>
          </View>
        </View>

        <View
          style={{ borderColor: theme.border }}
          className='flex-row flex-wrap justify-between px-4 py-6'
        >
          <TouchableOpacity
            style={{ backgroundColor: theme.background2 }}
            className={`w-[48%] rounded-lg p-4 items-center mb-4`}
            onPress={() => {
              props.navigation.navigate("ReservationBoxScreen")
            }}
          >
            <Ionicons
              name='cube-outline'
              size={24}
              color={theme.primary[500]}
            />
            <Text
              style={{ fontFamily: "PublicSans-regular", color: theme.text }}
              className={`mt-2 text-base text-center`}
            >
              Reservation Box
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: theme.background2 }}
            className={`w-[48%] rounded-lg p-4 items-center mb-4`}
            onPress={() => {
              props.navigation.navigate("OrdersScreen")
            }}
          >
            <Ionicons
              name='basket-outline'
              size={24}
              color={theme.primary[500]}
            />
            <Text
              style={{ fontFamily: "PublicSans-regular", color: theme.text }}
              className={`mt-2 text-base text-center`}
            >
              My Orders
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: theme.background2 }}
            className={`w-[48%] rounded-lg p-4 items-center mb-4`}
            onPress={() => {
              console.log("clicked")
              props.navigation.navigate("Collection")
            }}
          >
            <Ionicons
              name='cube-outline'
              size={24}
              color={theme.primary[500]}
            />
            <Text
              style={{ fontFamily: "PublicSans-regular", color: theme.text }}
              className={`mt-2 text-base text-center`}
            >
              My Collection
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: theme.background2 }}
            className={`w-[48%] rounded-lg p-4 items-center mb-4`}
            onPress={() => {
              props.navigation.navigate("WantlistScreen")
            }}
          >
            <Ionicons
              name='list-outline'
              size={24}
              color={theme.primary[500]}
            />
            <Text
              style={{ fontFamily: "PublicSans-regular", color: theme.text }}
              className={`mt-2 text-base text-center`}
            >
              Wantlist
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Logout Button at Bottom */}
      <View className='px-4 pb-8 absolute left-0 right-0 bottom-0 bg-transparent'>
        <TouchableOpacity
          className={`flex-row items-center justify-between py-4  ${`border-b-${theme.border}`}`}
          onPress={() => {
            removeAuthToken()
            store.setOnboardingDone(true)
            store.setCartItems([])
            store.setCartCount(0)
            store.setCollectionCount(0)
            store.setUser(null)
          }}
        >
          <View className='flex-row items-center'>
            <Ionicons name='log-out-outline' size={22} color={theme.text} />
            <Text
              style={{ fontFamily: "PublicSans-regular", color: theme.text }}
              className={`ml-3 text-base`}
            >
              Logout
            </Text>
          </View>
          <Ionicons name='chevron-forward' size={20} color={theme.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
