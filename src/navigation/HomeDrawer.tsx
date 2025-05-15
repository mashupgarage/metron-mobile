import { createDrawerNavigator } from "@react-navigation/drawer";
import Home from "../screens/dashboard/home";
import CGC from "../screens/dashboard/cgc";
import Comics from "../screens/dashboard/comics";
import Novels from "../screens/dashboard/novels";

const Drawer = createDrawerNavigator();

const HomeDrawer = () => {
  return (
    <Drawer.Navigator
      id={undefined}
      initialRouteName="Marketplace"
      screenOptions={{
        headerShown: false,
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
