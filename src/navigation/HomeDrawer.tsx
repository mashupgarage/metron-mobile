import { createDrawerNavigator } from "@react-navigation/drawer";
import Home from "../screens/dashboard/home";
import Comics from "../screens/dashboard/comics";
import CustomDrawerContent from "../components/CustomDrawer";

const Drawer = createDrawerNavigator();

const HomeDrawer = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen name="New Releases" component={Home} />
      <Drawer.Screen name="Comics" component={Comics} />
      <Drawer.Screen name="Graphic Novels" component={Home} />
      <Drawer.Screen name="CGC" component={Home} />
    </Drawer.Navigator>
  );
};

export default HomeDrawer;
