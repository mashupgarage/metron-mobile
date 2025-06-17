import { Box } from "@/src/components/ui/box";
import React from "react";
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBoundStore } from "@/src/store";

const DashboardLayout = ({ children }: { children: React.ReactElement }) => {
  const safeArea = useSafeAreaInsets();
  const theme = useBoundStore((state) => state.theme);
  return (
    <Box
      style={{
        paddingTop: safeArea.top,
        marginBottom: safeArea.bottom,
        backgroundColor: theme.background,
      }}
    >
      <React.Fragment>{children}</React.Fragment>
    </Box>
  );
};

export default DashboardLayout;
