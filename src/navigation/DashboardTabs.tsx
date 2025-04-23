import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import SearchScreen from "../screens/dashboard/search";
import CartScreen from "../screens/dashboard/cart";
import ProfileSceen from "../screens/dashboard/profile";

import { House, Search, ShoppingBag, User2 } from "lucide-react-native";
import { useBoundStore } from "../store";
import { useEffect, useState } from "react";
import HomeDrawer from "./HomeDrawer";

const DashboardTab = createBottomTabNavigator();

const DashboardTabs = () => {
  const cartCount = useBoundStore((state) => state.cartCount);
  const [badgeCount, setBadgeCount] = useState(cartCount);

  useEffect(() => {
    setBadgeCount(cartCount);
  }, [cartCount]);

  const screenConfig = ({
    route,
  }: {
    route: { name: string };
  }): BottomTabNavigationOptions => ({
    headerShown: false,
    tabBarIcon: ({ color }) => iconDisplay(route.name, color, 24),
    tabBarBadge:
      route.name === "My Cart"
        ? badgeCount === 0
          ? undefined
          : badgeCount
        : undefined,
  });

  const iconDisplay = (route: string, color: string, size: number) => {
    switch (route) {
      case "Home":
        return <House color={color} size={size} />;
      case "Search":
        return <Search color={color} size={size} />;
      case "My Cart":
        return <ShoppingBag color={color} size={size} />;
      case "Profile":
        return <User2 color={color} size={size} />;
    }

    return null;
  };

  return (
    <DashboardTab.Navigator>
      <DashboardTab.Screen
        options={screenConfig}
        name="Home"
        component={HomeDrawer}
      />
      <DashboardTab.Screen
        options={screenConfig}
        name="Search"
        component={SearchScreen}
      />
      <DashboardTab.Screen
        options={screenConfig}
        name="My Cart"
        component={CartScreen}
      />
      <DashboardTab.Screen
        options={screenConfig}
        name="Profile"
        component={ProfileSceen}
      />
    </DashboardTab.Navigator>
  );
};

export default DashboardTabs;
