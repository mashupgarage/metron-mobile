import { createStackNavigator } from "@react-navigation/stack"

import Onboarding from "../screens/dashboard/onboarding"
import ProductScreen from "../screens/dashboard/product"
import WantlistScreen from "../screens/dashboard/wantlist/WantlistScreen"
import ReservationBoxScreen from "../screens/dashboard/reservationBox/ReservationBoxScreen"
import CGCSubmitScreen from "../screens/dashboard/cgc-submit"
import { useBoundStore } from "../store"
import { screenOption } from "../utils/screenOption"
import DashboardTabs from "./DashboardTabs"
import EditProfile from "../screens/dashboard/edit-profile"
import CollectionScreen from "../screens/dashboard/collection"
import DetailedCollectionScreen from "../screens/dashboard/collection/detailed-display"
import CheckoutScreen from "../screens/dashboard/CheckoutScreen"
import OrdersScreen from "../screens/dashboard/orders/OrdersScreen"
import OrderDetails from "../screens/dashboard/orders/OrderDetails"

const Stack = createStackNavigator()
export function DashboardStack() {
  const store = useBoundStore()

  return (
    <Stack.Navigator id={undefined}>
      {store.isOnboardingDone === false &&
      store.user?.primary_address === null ? (
        <Stack.Screen
          name='Onboarding'
          options={screenOption}
          component={Onboarding}
        />
      ) : (
        <Stack.Screen
          name='Home'
          options={screenOption}
          component={DashboardTabs}
        />
      )}
      <Stack.Screen
        name='Product'
        options={screenOption}
        component={ProductScreen}
      />
      <Stack.Screen
        name='WantlistScreen'
        options={{ headerShown: false, title: "My Want List" }}
        component={WantlistScreen}
      />
      <Stack.Screen
        name='ReservationBoxScreen'
        options={{ headerShown: false, title: "Reservation Box" }}
        component={ReservationBoxScreen}
      />
      <Stack.Screen
        name='CGCSubmit'
        options={screenOption}
        component={CGCSubmitScreen}
      />
      <Stack.Screen
        name='EditProfile'
        options={screenOption}
        component={EditProfile}
      />
      <Stack.Screen
        name='Collection'
        options={screenOption}
        component={CollectionScreen}
      />
      <Stack.Screen
        name='DetailedCollectionScreen'
        options={screenOption}
        component={DetailedCollectionScreen}
      />
      <Stack.Screen
        name='CheckoutScreen'
        options={screenOption}
        component={CheckoutScreen}
      />
      <Stack.Screen
        name='OrdersScreen'
        options={screenOption}
        component={OrdersScreen}
      />
      <Stack.Screen
        name='OrderDetails'
        options={screenOption}
        component={OrderDetails}
      />
    </Stack.Navigator>
  )
}
