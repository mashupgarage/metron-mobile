import React from "react";
import { Dimensions, View } from "react-native";
import { useBoundStore } from "@/src/store";
const SeriesCardSkeleton = ({ horizontal = false }) => {
  const theme = useBoundStore((state) => state.theme)
  const thirdWidth = Dimensions.get('window').width / 3;
  return (
    <View
      style={{
        width: thirdWidth * 0.9,
        borderRadius: 2,
        marginHorizontal: theme.spacing.xs,
        shadowColor: theme.background2,
        shadowOpacity: 0.05,
        shadowRadius: 2,
        paddingTop: 8,
        alignSelf: "flex-start",
      }}
    >
      {/* Image skeleton */}
      <View
        style={{
          height: 200,
          width: "100%",
          backgroundColor: theme.background2,
          marginBottom: theme.spacing.xs,
          borderRadius: 2,
        }}
      />
      {/* Title skeleton */}
      <View
        style={{
          height: 18,
          width: "70%",
          backgroundColor: theme.background2,
          marginBottom: theme.spacing.xs,
          borderRadius: 2,
        }}
      />
      {/* Subtitle skeleton */}
      <View
        style={{
          height: 18,
          width: "70%",
          borderRadius: 2,
          backgroundColor: theme.background2,
        }}
      />
    </View>
  );
};

export default SeriesCardSkeleton;
