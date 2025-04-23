import { Box } from "@/src/components/ui/box";
import { Button, ButtonText } from "@/src/components/ui/button";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";

const AuthLayout = ({
  children,
  showBackButton = false,
  ...props
}: {
  children: React.ReactElement;
  showBackButton: boolean;
  navigation: any;
}) => {
  return (
    <ScrollView>
      {showBackButton && (
        <Button
          onPress={() => {
            props.navigation.replace("Dashboard", { screen: "Home" });
          }}
          className="absolute ml-4 top-16 p-0"
          variant="link"
        >
          <ArrowLeft />
          <ButtonText>Back</ButtonText>
        </Button>
      )}
      <Box className="pt-16 mt-24 p-4 pb-12">{children}</Box>
    </ScrollView>
  );
};

export default AuthLayout;
