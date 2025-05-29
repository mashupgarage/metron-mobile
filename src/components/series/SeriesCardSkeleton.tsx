import React from "react";
import { useColorScheme, View } from "react-native";
const SeriesCardSkeleton = ({ horizontal = false }) => {
  const colorScheme = useColorScheme();
  return (
    <View
      style={{
        width: 180,
        marginRight: horizontal ? 12 : 0,
        marginBottom: horizontal ? 0 : 16,
        borderRadius: 8,
        shadowColor: colorScheme === "dark" ? "#121212" : "#000",
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 8,
        alignSelf: "flex-start",
      }}
    >
      {/* Image skeleton */}
      <View
        style={{
          height: 200,
          width: "90%",
          borderRadius: 8,
          backgroundColor: colorScheme === "dark" ? "#121212" : "#e5e7eb",
          marginBottom: 12,
        }}
      />
      {/* Title skeleton */}
      <View
        style={{
          height: 18,
          width: "70%",
          backgroundColor: colorScheme === "dark" ? "#121212" : "#e5e7eb",
          borderRadius: 4,
          marginBottom: 8,
        }}
      />
      {/* Subtitle skeleton */}
      <View
        style={{
          height: 14,
          width: "50%",
          borderRadius: 4,
          backgroundColor: colorScheme === "dark" ? "#121212" : "#e5e7eb",
        }}
      />
    </View>
  );
};

export default SeriesCardSkeleton;
