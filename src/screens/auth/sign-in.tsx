import SocialFields from "@/src/components/forms/social-fields";
import SignInForm from "@/src/components/forms/sign-in";
import { Text } from "@/src/components/ui/text";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import Divider from "@/src/components/divider";
import { Button, ButtonText } from "@/src/components/ui/button";
import { HStack } from "@/src/components/ui/hstack";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { AuthStackParams } from "@/src/utils/types/navigation";
import AuthLayout from "./_layout";
import React from "react";
import { authenticateUser } from "@/src/api/apiEndpoints";
import { useBoundStore } from "@/src/store";

export default function SignIn(props: {
  navigation: {
    replace: (arg0: string, arg1: { screen: string }) => void;
  };
}) {
  const { setLoading } = useBoundStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigation = useNavigation<NavigationProp<AuthStackParams>>();

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthLayout showBackButton={true} navigation={props.navigation}>
      <React.Fragment>
        <Text className="mt-8 mb-8" size="3xl" bold>
          Welcome Back!
        </Text>
        <SignInForm
          email={email}
          password={password}
          setEmailValue={setEmail}
          setPasswordValue={setPassword}
          handleSubmit={(payload) => {
            setLoading(true);
            setTimeout(() => setLoading(false), 2000);
            if (payload.email && payload.password) {
              authenticateUser(payload.email, payload.password)
                .then((data) => {
                  console.log("data >", data);
                  // in this flow, we will store necessary user data in the user store.
                  // props.navigation.replace("Dashboard");
                })
                .catch((error) => {
                  console.log("error >", error);
                });
            }
          }}
        />
        <Divider text="or" />
        <SocialFields />
        <StatusBar style="auto" />
        <Divider withText={false} />
        <HStack className="justify-center items-center">
          <Text>Don't you have an account? </Text>
          <Button
            variant="link"
            onPress={() => {
              navigation.navigate("SignUp");
            }}
            size="md"
          >
            <ButtonText className="text-blue-500">Sign up</ButtonText>
          </Button>
        </HStack>
      </React.Fragment>
    </AuthLayout>
  );
}
