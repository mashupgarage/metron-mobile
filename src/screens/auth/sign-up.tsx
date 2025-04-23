import SocialFields from "@/src/components/forms/social-fields";
import { Text } from "@/src/components/ui/text";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import Divider from "@/src/components/divider";
import { Button, ButtonText } from "@/src/components/ui/button";
import { HStack } from "@/src/components/ui/hstack";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { AuthStackParams } from "@/src/utils/types/navigation";
import SignUpForm from "@/src/components/forms/sign-up";
import AuthLayout from "./_layout";
import React from "react";
import { useBoundStore } from "@/src/store";

export default function SignUp(props: {
  navigation: {
    replace: (arg0: string, arg1: { screen: string }) => void;
  };
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const store = useBoundStore();
  const navigation = useNavigation<NavigationProp<AuthStackParams>>();

  return (
    <AuthLayout showBackButton={false} navigation={props.navigation}>
      <React.Fragment>
        <Text className="mt-8 mb-8" size="3xl" bold>
          Create your Account
        </Text>
        <SignUpForm
          email={email}
          password={password}
          fullName={fullName}
          setEmailValue={setEmail}
          setFullNameValue={setFullName}
          setPasswordValue={setPassword}
          handleSubmit={(payload) => {
            console.log("wow", payload);
          }}
        />
        <Divider text="or" />
        <SocialFields />
        <StatusBar style="auto" />
        <Divider withText={false} />
        <HStack className="justify-center items-center">
          <Text>Have an account? </Text>
          <Button
            variant="link"
            onPress={() => {
              navigation.navigate("SignIn");
            }}
            size="md"
          >
            <ButtonText className="text-blue-500">Sign in</ButtonText>
          </Button>
        </HStack>
      </React.Fragment>
    </AuthLayout>
  );
}
