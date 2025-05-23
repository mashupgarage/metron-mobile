import { Box } from "@/src/components/ui/box";
import React from "react";
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DashboardLayout = ({ children }: { children: React.ReactElement }) => {
  const safeArea = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  return (
    <Box
      style={{
        paddingTop: safeArea.top,
        marginBottom: safeArea.bottom,
        backgroundColor: colorScheme === "dark" ? "#121212" : "#ffffff",
      }}
    >
      <React.Fragment>{children}</React.Fragment>
    </Box>
  );
};

export default DashboardLayout;
