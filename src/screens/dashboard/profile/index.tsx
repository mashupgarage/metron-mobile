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
  const collectionCount = store.collectionCount ?? 0;
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

      // Fetch real orders count
      getReservationList(store.user.id)
        .then((res) => {
          setOrdersCount(
            Array.isArray(res.data)
              ? res.data.length
              : res.data.reservations.length || 0
          );
        })
        .catch(() => setOrdersCount(0));

      // Fetch real collection count
      getMyCollection(store.user.id)
        .then((res) => {
          setCollectionCount(
            Array.isArray(res.data)
              ? res.data.length
              : res.data.collection?.length || 0
          );
        })
        .catch(() => setCollectionCount(0));
    }
  }, [store.user, props.navigation]);

  if (store.user === null) {
    return null; // or a loading spinner
  }

  const handleEditProfile = () => {
    // Implement edit profile functionality
    console.log("Edit profile pressed");
  };

  const handleOrderPress = (orderId: string) => {
    // Implement order detail navigation
    console.log(`Order ${orderId} pressed`);
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
            <Text>Edit Profile</Text>
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
            <Text style={styles.statLabel}>My Collection</Text>
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
              // console.log("display user data", store.user);
              getReservationList(store.user?.id).then((res) => {
                console.log("reservation list", res.data.reservations);
              });
            }}
          >
            <Ionicons name="cube-outline" size={24} color="#4285F4" />
            <Text style={styles.actionText}>Reservation Box</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              console.log("clicked");
              getWantList().then((res) => {
                // handle want list display
                console.log("want list", res.data.want_lists.length);
              });
            }}
          >
            <Ionicons name="cube-outline" size={24} color="#4285F4" />
            <Text style={styles.actionText}>Wantlist</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              console.log("clicked");
              getMyCollection(store.user?.id).then((res) => {
                // handle want list display
                console.log("orders list", res.data);
              });
            }}
          >
            <Ionicons name="cube-outline" size={24} color="#4285F4" />
            <Text style={styles.actionText}>My Collection</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsContainer}>
          {/* Settings Items */}

          <TouchableOpacity
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
