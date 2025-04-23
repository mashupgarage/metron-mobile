import SignIn from "@/src/screens/auth/sign-in";
import SignUp from "@/src/screens/auth/sign-up";
import { screenOption } from "@/src/utils/screenOption";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();
export function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SignIn" options={screenOption} component={SignIn} />
      <Stack.Screen name="SignUp" options={screenOption} component={SignUp} />
    </Stack.Navigator>
  );
}
