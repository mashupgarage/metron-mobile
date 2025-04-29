import { useBoundStore } from "@/src/store";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function Profile(props: { navigation: any }) {
  const store = useBoundStore();

  useEffect(() => {
    if (store.user === null) {
      props.navigation.replace("Auth", { screen: "SignIn" });
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
            <Text style={styles.statNumber}>17</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>381</Text>
            <Text style={styles.statLabel}>My Collection</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Wantlist</Text>
          </View>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => props.navigation.navigate("TrackOrder")}
          >
            <Ionicons name="cube-outline" size={24} color="#4285F4" />
            <Text style={styles.actionText}>Track Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => props.navigation.navigate("PaymentMethods")}
          >
            <Ionicons name="card-outline" size={24} color="#4285F4" />
            <Text style={styles.actionText}>Payment Methods</Text>
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
            onPress={() => handleSettingPress("About")}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  settingsButton: {
    position: "absolute",
    right: 20,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "85%",
    alignItems: "center",
  },
  editButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    marginHorizontal: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderDetails: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 14,
    color: "#4CAF50",
  },
  inTransit: {
    color: "#2196F3",
  },
  orderPrice: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  actionButton: {
    width: "48%",
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  settingsContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
