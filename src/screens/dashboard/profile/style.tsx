import { StyleSheet } from "react-native";
export const profileStyles = StyleSheet.create({
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
    fontFamily: "Inter",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
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
