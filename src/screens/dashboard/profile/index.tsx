import { useBoundStore } from "@/src/store";
import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  useColorScheme,
} from "react-native";
import { useEffect, useState } from "react";
import { useWantListStore } from "@/src/store/slices/WantListSlice";
import { Ionicons } from "@expo/vector-icons";
import {
  getMyCollection,
  getReservationList,
  getWantList,
  getUserCollection,
} from "@/src/api/apiEndpoints";

import { removeAuthToken } from "@/src/api/tokenManager";

export default function Profile(props: { navigation: any }) {
  const store = useBoundStore();
  const colorScheme = useColorScheme();
  const wantlistCount = useWantListStore((state) => state.wantlistCount);
  const setWantlistCount = useWantListStore((state) => state.setWantlistCount);
  // Use dedicated slices for ordersCount and collectionCount
  const ordersCount = store.ordersCount ?? 0;
  const collectionCount = store.user?.series_ids.length ?? 0;
  const setOrdersCount = (count: number) => store.setOrdersCount(count);
  const setCollectionCount = (count: number) => store.setCollectionCount(count);

  useEffect(() => {
    if (store.user === null) {
      props.navigation.replace("Auth", { screen: "SignIn" });
    } else {
      // Fetch wantlist count on mount
      getWantList()
        .then((res) => {
          setWantlistCount(res.data.want_lists.length);
        })
        .catch((err) => {
          setWantlistCount(0);
        });

      // Fetch real orders count (filter out 'fill' status)
      getReservationList(store.user.id)
        .then((res) => {
          console.log("actual reservation", res.data.metadata?.total_count);
          setOrdersCount(res.data.metadata?.total_count ?? 0);
        })
        .catch(() => setOrdersCount(0));

      // Fetch real collection count from getUserCollection, filter out 'fill' status
      getUserCollection(store.user.id)
        .then((res) => {
          console.log("actual collection", res.data);
          setCollectionCount(res.data.ordered_products.length);
        })
        .catch(() => {
          setCollectionCount(0);
        });
    }
  }, [store.user, props.navigation]);

  if (store.user === null) {
    return null; // or a loading spinner
  }

  const handleEditProfile = () => {
    props.navigation.navigate("EditProfile");
  };

  const handleSettingPress = (setting: string) => {
    // Handle settings navigation
    console.log(`${setting} pressed`);
  };

  return (
    <SafeAreaView
      style={{
        paddingTop: 24,
      }}
      className={`flex-1 ${
        colorScheme === "dark" ? "bg-mdark-background" : "bg-white"
      }`}
    >
      <View
        className={`flex-row items-center justify-between py-4 px-5 border-b ${
          colorScheme === "dark"
            ? "border-b-mdark-surface"
            : "border-b-gray-200"
        }`}
      >
        {/* <Text className="text-xl font-semibold">Profile</Text> */}
        <View />
        <TouchableOpacity onPress={handleEditProfile}>
          <Text className="font-semibold text-primary-600">Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 pb-32">
        <View className="items-center py-6">
          <Image
            source={{ uri: "https://picsum.photos/200" }}
            className="w-24 h-24 rounded-full mb-3"
          />
          <Text
            className={`text-xl font-bold mb-1 ${
              colorScheme === "dark" ? "text-mdark-text" : "text-gray-900"
            }`}
          >
            {store.user?.full_name}
          </Text>
          <Text
            className={`text-base ${
              colorScheme === "dark"
                ? "text-mdark-textSecondary"
                : "text-gray-500"
            }`}
          >
            {store.user?.email}
          </Text>
        </View>

        <View className="flex-row justify-around py-5 border-y border-gray-200 mx-4">
          <View className="items-center">
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
          </View>
          <View className="items-center">
            <Text
              className={`text-2xl font-bold ${
                colorScheme === "dark" ? "text-mdark-text" : "text-gray-900"
              }`}
            >
              {collectionCount}
            </Text>
            <Text
              className={`text-base ${
                colorScheme === "dark"
                  ? "text-mdark-textSecondary"
                  : "text-gray-500"
              }`}
            >
              Series Collections
            </Text>
          </View>
          <View className="items-center">
            <Text
              className={`text-2xl font-bold ${
                colorScheme === "dark" ? "text-mdark-text" : "text-gray-900"
              }`}
            >
              {wantlistCount}
            </Text>
            <Text
              className={`text-base ${
                colorScheme === "dark"
                  ? "text-mdark-textSecondary"
                  : "text-gray-500"
              }`}
            >
              Wantlist
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between px-4 py-6">
          <TouchableOpacity
            className={`w-[48%] rounded-lg p-4 items-center mb-4 ${
              colorScheme === "dark" ? "bg-mdark-surface" : "bg-gray-100"
            }`}
            onPress={() => {
              props.navigation.navigate("ReservationBoxScreen");
            }}
          >
            <Ionicons
              name="cube-outline"
              size={24}
              color={colorScheme === "dark" ? "#90cdf4" : "#4285F4"}
            />
            <Text
              className={`mt-2 text-base text-center ${
                colorScheme === "dark" ? "text-mdark-text" : "text-gray-900"
              }`}
            >
              Reservation Box
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`w-[48%] rounded-lg p-4 items-center mb-4 ${
              colorScheme === "dark" ? "bg-mdark-surface" : "bg-gray-100"
            }`}
            onPress={() => {
              props.navigation.navigate("WantlistScreen");
            }}
          >
            <Ionicons
              name="list-outline"
              size={24}
              color={colorScheme === "dark" ? "#90cdf4" : "#4285F4"}
            />
            <Text
              className={`mt-2 text-base text-center ${
                colorScheme === "dark" ? "text-mdark-text" : "text-gray-900"
              }`}
            >
              Wantlist
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            disabled
            className={`w-[48%] rounded-lg p-4 items-center mb-4 ${
              colorScheme === "dark" ? "bg-mdark-surface" : "bg-gray-100"
            }`}
            onPress={async () => {
              console.log("clicked");
              getMyCollection(store.user?.id).then((res) => {
                // handle want list display
              });
              props.navigation.navigate("Collection");
            }}
          >
            <Ionicons
              name="cube-outline"
              size={24}
              color={colorScheme === "dark" ? "#90cdf4" : "#4285F4"}
            />
            <Text
              className={`mt-2 text-base text-center ${
                colorScheme === "dark" ? "text-[#dadada]" : "text-[#333]"
              }`}
            >
              My Collection
            </Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
      {/* Logout Button at Bottom */}
      <View className="px-4 pb-8 absolute left-0 right-0 bottom-0 bg-transparent">
        <TouchableOpacity
          className={`flex-row items-center justify-between py-4  ${
            colorScheme === "dark" ? "border-b-[#333]" : "border-b-[#f0f0f0]"
          }`}
          onPress={() => {
            removeAuthToken();
            store.setOnboardingDone(true);
            store.setCartItems([]);
            store.setCartCount(0);
            store.setCollectionCount(0);
            store.setUser(null);
          }}
        >
          <View className="flex-row items-center">
            <Ionicons
              name="log-out-outline"
              size={22}
              color={colorScheme === "dark" ? "#dadada" : "#333"}
            />
            <Text
              className={`ml-3 text-base ${
                colorScheme === "dark" ? "text-[#dadada]" : "text-[#333]"
              }`}
            >
              Logout
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colorScheme === "dark" ? "#999" : "#999"}
          />
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
