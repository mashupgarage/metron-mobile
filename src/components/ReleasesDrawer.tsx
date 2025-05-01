import React, { useEffect, useRef } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "./ui/text";
import { X } from "lucide-react-native";

interface ReleaseDate {
  date: string;
  count: number;
}

interface ReleasesDrawerProps {
  visible: boolean;
  releaseDates: ReleaseDate[];
  onClose: () => void;
  onSelectDate: (date: string) => void;
  onShowAllReleases: () => void;
}

const ReleasesDrawer: React.FC<ReleasesDrawerProps> = ({
  visible,
  releaseDates,
  onClose,
  onSelectDate,
  onShowAllReleases,
}) => {
  const drawerAnimation = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(drawerAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(drawerAnimation, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <>
      {visible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: drawerAnimation }],
          },
        ]}
      >
        <SafeAreaView style={styles.drawerContent}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerHeaderText}>Release History</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#333333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.drawerList}>
            <TouchableOpacity
              style={[styles.drawerItem, styles.allReleasesItem]}
              onPress={() => {
                onShowAllReleases();
                onClose();
              }}
            >
              <Text style={styles.drawerItemText}>LATEST RELEASE</Text>
            </TouchableOpacity>

            {releaseDates.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.drawerItem}
                onPress={() => {
                  onSelectDate(item.date);
                }}
              >
                <Text style={styles.drawerItemText}>{item.date}</Text>
                <View style={styles.drawerBadge}>
                  <Text style={styles.drawerBadgeText}>{item.count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: "#fff",
    zIndex: 2,
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  drawerHeaderText: {
    color: "#333333",
    fontSize: 20,
    fontWeight: "bold",
  },
  drawerList: {
    flex: 1,
  },
  drawerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  allReleasesItem: {
    backgroundColor: "#f0f0f0",
  },
  drawerItemText: {
    color: "#333333",
    fontSize: 16,
  },
  drawerBadge: {
    backgroundColor: "rgb(43,100,207)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  drawerBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});

export default ReleasesDrawer;
