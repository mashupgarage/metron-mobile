import { createStackNavigator } from "@react-navigation/stack";

import Onboarding from "../screens/dashboard/onboarding";
import ProductScreen from "../screens/dashboard/product";
import WantlistScreen from "../screens/dashboard/wantlist/WantlistScreen";
import ReservationBoxScreen from "../screens/dashboard/reservationBox/ReservationBoxScreen";
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
      <Stack.Screen
        name="WantlistScreen"
        options={{ headerShown: false, title: "My Want List" }}
        component={WantlistScreen}
      />
      <Stack.Screen
        name="ReservationBoxScreen"
        options={{ headerShown: false, title: "Reservation Box" }}
        component={ReservationBoxScreen}
      />
    </Stack.Navigator>
  );
}
