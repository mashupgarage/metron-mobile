import React, { useEffect, useRef } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Text } from "./ui/text";
import { X } from "lucide-react-native";

interface ReleaseDate {
  id: number;
  date: string;
  count: number;
}

interface ReleasesDrawerProps {
  visible: boolean;
  releaseDates: ReleaseDate[];
  selectedReleaseId: number | null;
  onClose: () => void;
  onSelectDate: (id: number, date: string) => void;
  onShowAllReleases: () => void;
}

const ReleasesDrawer: React.FC<ReleasesDrawerProps> = ({
  visible,
  releaseDates,
  selectedReleaseId,
  onClose,
  onSelectDate,
  onShowAllReleases,
}) => {
  const drawerAnimation = useRef(new Animated.Value(-300)).current;
  const colorScheme = useColorScheme();
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
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 z-[1]"
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 300,
            backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff",
            zIndex: 2,
            transform: [{ translateX: drawerAnimation }],
          },
        ]}
      >
        <SafeAreaView className="flex-1">
          <View className="p-4 border-b flex-row justify-between items-center">
            <Text
              style={{ fontFamily: "Urbanist-Bold" }}
              className="text-xl font-bold"
            >
              Release History
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colorScheme === "dark" ? "white" : "black"} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            <TouchableOpacity
              className="flex-row justify-between items-center p-4"
              onPress={() => {
                onShowAllReleases();
                onClose();
              }}
            >
              <Text
                style={{ fontFamily: "PublicSans-regular" }}
                className="text-base"
              >
                LATEST RELEASE
              </Text>
            </TouchableOpacity>

            {releaseDates.map((item) => (
              <TouchableOpacity
                key={item.id}
                className={`flex-row justify-between items-center p-4 border-b ${
                  item.id === selectedReleaseId ? "bg-primary-50" : ""
                }`}
                style={{
                  backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff",
                }}
                onPress={() => {
                  onSelectDate(item.id, item.date);
                }}
              >
                <Text
                  style={{ fontFamily: "PublicSans-regular" }}
                  className="text-base"
                >
                  {item.date}
                </Text>
                <View
                  style={{
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgb(23,90,160)"
                        : "rgb(43,100,207)",
                  }}
                  className=" rounded px-2 py-0.5"
                >
                  <Text
                    style={{ fontFamily: "PublicSans-regular" }}
                    className="text-white text-sm"
                  >
                    {item.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

export default ReleasesDrawer;
