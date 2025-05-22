import { createDrawerNavigator } from "@react-navigation/drawer";
import { useColorScheme } from "react-native";
import Home from "../screens/dashboard/home";
import CGC from "../screens/dashboard/cgc";
import Comics from "../screens/dashboard/comics";
import Novels from "../screens/dashboard/novels";

const Drawer = createDrawerNavigator();

const HomeDrawer = () => {
  const colorScheme = useColorScheme();
  return (
    <Drawer.Navigator
      id={undefined}
      initialRouteName="Marketplace"
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff",
        },
        drawerContentStyle: {
          backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff",
        },
        drawerLabelStyle: {
          color: colorScheme === "dark" ? "#dadada" : "#222",
        },
      }}
    >
      <Drawer.Screen name="Marketplace" component={Home} />
      <Drawer.Screen name="Comics" component={Comics} />
      <Drawer.Screen name="Graphic Novels" component={Novels} />
      <Drawer.Screen name="CGC" component={CGC} />
    </Drawer.Navigator>
  );
};

export default HomeDrawer;
