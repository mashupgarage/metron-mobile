import { useBoundStore } from "@/src/store";
import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
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
import { profileStyles } from "./style";
import { removeAuthToken } from "@/src/api/tokenManager";

export default function Profile(props: { navigation: any }) {
  const store = useBoundStore();
  const styles = profileStyles;
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* <Text style={styles.headerTitle}>Profile</Text> */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => handleSettingPress("Settings")}
        >
          <TouchableOpacity onPress={handleEditProfile}>
            <Text className="font-semibold">Edit Profile</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: "https://picsum.photos/200" }}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{store.user?.full_name}</Text>
          <Text style={styles.userEmail}>{store.user?.email}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{ordersCount}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{collectionCount}</Text>
            <Text style={styles.statLabel}>Series Collections</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{wantlistCount}</Text>
            <Text style={styles.statLabel}>Wantlist</Text>
          </View>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              props.navigation.navigate("ReservationBoxScreen");
            }}
          >
            <Ionicons name="cube-outline" size={24} color="#4285F4" />
            <Text style={styles.actionText}>Reservation Box</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              props.navigation.navigate("WantlistScreen");
            }}
          >
            <Ionicons name="list-outline" size={24} color="#4285F4" />
            <Text style={styles.actionText}>Wantlist</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              console.log("clicked");
              getMyCollection(store.user?.id).then((res) => {
                // handle want list display
              });
              props.navigation.navigate("Collection");
            }}
          >
            <Ionicons name="cube-outline" size={24} color="#4285F4" />
            <Text style={styles.actionText}>My Collection</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsContainer}>
          {/* Settings Items */}

          <TouchableOpacity
            disabled
            style={styles.settingItem}
            onPress={() => handleSettingPress("Help Center")}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle-outline" size={22} color="#333" />
              <Text style={styles.settingText}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            disabled
            onPress={() => handleSettingPress("About")}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#333"
              />
              <Text style={styles.settingText}>About</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              removeAuthToken();
              store.setOnboardingDone(true);
              store.setCartItems([]);
              store.setCartCount(0);
              store.setCollectionCount(0);
              store.setUser(null);
            }}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="log-out-outline" size={22} color="#333" />
              <Text style={styles.settingText}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
