import { createStackNavigator } from "@react-navigation/stack";

import Onboarding from "../screens/dashboard/onboarding";
import ProductScreen from "../screens/dashboard/product";
import { useBoundStore } from "../store";
import { screenOption } from "../utils/screenOption";
import DashboardTabs from "./DashboardTabs";

const Stack = createStackNavigator();
export function DashboardStack() {
  const store = useBoundStore();

  return (
    <Stack.Navigator>
      {store.isOnboardingDone === false && store.user === null ? (
        <Stack.Screen
          name="Onboarding"
          options={screenOption}
          component={Onboarding}
        />
      ) : (
        <Stack.Screen
          name="Home"
          options={screenOption}
          component={DashboardTabs}
        />
      )}
      <Stack.Screen
        name="Product"
        options={screenOption}
        // @ts-ignore
        component={ProductScreen}
      />
    </Stack.Navigator>
  );
}
