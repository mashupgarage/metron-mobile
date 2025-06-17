import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import SearchScreen from "../screens/dashboard/search";
import CartScreen from "../screens/dashboard/cart";
import ProfileSceen from "../screens/dashboard/profile";
import ReservationsScreen from "../screens/dashboard/reservations";

import {
  BookOpen,
  House,
  Search,
  ShoppingBag,
  User2,
} from "lucide-react-native";
import { useBoundStore } from "../store";
import HomeDrawer from "./HomeDrawer";
import { useColorScheme, View } from "react-native";

const DashboardTab = createBottomTabNavigator();

const DashboardTabs = () => {
  const cartItems = useBoundStore((state) => state.cartItems);
  const theme = useBoundStore((state) => state.theme);
  const uniqueItemCount = new Set(cartItems.map((item) => item.id)).size;

  const screenConfig = ({
    route,
  }: {
    route: { name: string };
  }): BottomTabNavigationOptions => ({
    headerShown: false,
    tabBarStyle: {
      backgroundColor: theme.background,
    },
    tabBarIcon: ({ color }) => iconDisplay(route.name, color, 24),
    tabBarBadge:
      route.name === "My Cart"
        ? uniqueItemCount === 0
          ? undefined
          : uniqueItemCount
        : undefined,
    tabBarBadgeStyle: {
      backgroundColor: theme.error,
    },
  });

  const iconDisplay = (route: string, color: string, size: number) => {
    switch (route) {
      case "Marketplace":
        return <House color={color} size={size} />;
      case "Search":
        return <Search color={color} size={size} />;
      case "My Cart":
        return <ShoppingBag color={color} size={size} />;
      case "Reservations":
        // Bigger icon with circular background
        return (
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 50,
              backgroundColor: theme.background,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              shadowColor: theme.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 6,
              elevation: 8,
            }}
          >
            <BookOpen color={color} size={36} />
          </View>
        );
      case "Profile":
        return <User2 color={color} size={size} />;
    }

    return null;
  };

  return (
    <DashboardTab.Navigator id={undefined}>
      <DashboardTab.Screen
        options={{
          ...screenConfig({ route: { name: "Marketplace" } }),
        }}
        name="Home"
        component={HomeDrawer}
      />
      <DashboardTab.Screen
        options={{
          ...screenConfig({ route: { name: "Search" } }),
        }}
        name="Search"
        component={SearchScreen}
      />
      <DashboardTab.Screen
        options={{
          ...screenConfig({ route: { name: "Reservations" } }),
          tabBarIcon: ({ color }) => iconDisplay("Reservations", color, 24),
          tabBarLabel: () => null,
        }}
        name="Reservations"
        component={ReservationsScreen}
      />
      <DashboardTab.Screen
        options={{
          ...screenConfig({ route: { name: "My Cart" } }),
        }}
        name="My Cart"
        component={CartScreen}
      />
      <DashboardTab.Screen
        options={{
          ...screenConfig({ route: { name: "Profile" } }),
        }}
        name="Profile"
        component={ProfileSceen}
      />
    </DashboardTab.Navigator>
  );
};

export default DashboardTabs;
