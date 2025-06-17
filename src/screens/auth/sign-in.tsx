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
import { authenticateUser, fetchUserProfile } from "@/src/api/apiEndpoints";
import { saveAuthToken, loadAuthTokenToAxios } from "@/src/api/tokenManager";
import { useBoundStore } from "@/src/store";

export default function SignIn(props: {
  navigation: {
    replace: (arg0: string, arg1: { screen: string }) => void;
  };
}) {
  const { setLoading, setUser } = useBoundStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const theme = useBoundStore((state) => state.theme);
  const navigation = useNavigation<NavigationProp<AuthStackParams>>();

  useEffect(() => {
    setLoading(false);
    // Load token from storage to Axios on mount
    loadAuthTokenToAxios();
  }, []);

  return (
    <AuthLayout showBackButton={true} navigation={props.navigation}>
      <React.Fragment>
        <Text className="mt-8 mb-8" size="3xl" bold style={{ color: theme.text }}>
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
                .then((res) => {
                  console.log("data >", res.data);
                  if (res.data) {
                    // Save auth_token using AsyncStorage and update Axios
                    saveAuthToken(res.data.auth_token).then(() => {
                      fetchUserProfile(res.data.id)
                        .then((res) => {
                          console.log("profile fetched", res.data);
                          setUser(res.data);
                          // @ts-ignore
                          props.navigation.replace("Dashboard", {
                            screen: "Home",
                          });
                        })
                        .catch((error) => {
                          console.log("error ", error);
                        });
                    });
                  }
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
          <Text style={{ color: theme.text }}>Don't you have an account? </Text>
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
