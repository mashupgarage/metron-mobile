import React from "react";
import { Dimensions, View } from "react-native";
import { useBoundStore } from "@/src/store";
import { Box } from "../ui/box";
import { HStack } from "../ui/hstack";

interface SeriesCardSkeletonProps {
  horizontal?: boolean;
  grid?: boolean;
}

const SeriesCardSkeleton: React.FC<SeriesCardSkeletonProps> = ({ 
  horizontal = false, 
  grid = false 
}) => {
  const theme = useBoundStore((state) => state.theme);
  const thirdWidth = Dimensions.get('window').width / 3;

  // Grid layout skeleton (similar to product-card grid mode)
  if (grid) {
    return (
      <Box className='mb-2'>
        <View style={{ marginBottom: 0 }}>
          <View style={{ position: "relative" }}>
            {/* Image skeleton */}
            <View
              style={{
                height: 180, // h-56 equivalent
                width: thirdWidth * 0.85,
                backgroundColor: theme.background2,
                borderRadius: 2,
              }}
            />
          </View>
          <View className='mt-2 px-2'>
            <View style={{ minHeight: 48 }}>
              {/* Title skeleton */}
              <View
                style={{
                  height: 18,
                  width: "85%",
                  backgroundColor: theme.background2,
                  marginBottom: theme.spacing.xs,
                  borderRadius: 2,
                }}
              />
              <View
                style={{
                  height: 18,
                  width: "60%",
                  backgroundColor: theme.background2,
                  borderRadius: 2,
                }}
              />
            </View>
            {/* Meta info skeleton */}
            <View
              style={{
                height: 14,
                width: "50%",
                backgroundColor: theme.background2,
                marginTop: theme.spacing.xs,
                borderRadius: 2,
              }}
            />
          </View>
        </View>
      </Box>
    );
  }

  // List layout skeleton (similar to product-card list mode)
  if (horizontal) {
    return (
      <HStack space='xs' className='mb-3'>
        {/* Image skeleton */}
        <View
          style={{
            width: thirdWidth * 0.25,
            aspectRatio: 3/4,
            backgroundColor: theme.background2,
            borderRadius: 2,
          }}
        />
        <Box style={{ maxWidth: Dimensions.get("window").width - thirdWidth - 20 }}>
          {/* Title skeleton */}
          <View
            style={{
              height: 20,
              width: "90%",
              backgroundColor: theme.background2,
              marginBottom: theme.spacing.xs,
              borderRadius: 2,
            }}
          />
          <View
            style={{
              height: 20,
              width: "70%",
              backgroundColor: theme.background2,
              marginBottom: theme.spacing.xs,
              borderRadius: 2,
            }}
          />
          {/* Creators skeleton */}
          <View
            style={{
              height: 16,
              width: "60%",
              backgroundColor: theme.background2,
              marginBottom: theme.spacing.xs,
              borderRadius: 2,
            }}
          />
          {/* Publisher skeleton */}
          <View
            style={{
              height: 16,
              width: "45%",
              backgroundColor: theme.background2,
              borderRadius: 2,
            }}
          />
        </Box>
      </HStack>
    );
  }

  // Default grid-like layout (original behavior)
  return (
    <Box className='mb-2' style={{ width: thirdWidth * 0.9 }}>
      <View
        style={{
          borderRadius: 2,
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
            height: 180,
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
    </Box>
  );
};

export default SeriesCardSkeleton;
