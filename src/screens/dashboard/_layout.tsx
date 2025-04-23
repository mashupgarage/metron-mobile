import { Box } from "@/src/components/ui/box";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DashboardLayout = ({ children }: { children: React.ReactElement }) => {
  const safeArea = useSafeAreaInsets();
  return (
    <Box
      style={{
        marginTop: safeArea.top,
        marginBottom: safeArea.bottom,
      }}
    >
      <React.Fragment>{children}</React.Fragment>
    </Box>
  );
};

export default DashboardLayout;
