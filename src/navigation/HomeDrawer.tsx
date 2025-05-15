import { createDrawerNavigator } from "@react-navigation/drawer";
import Home from "../screens/dashboard/home";
import CGC from "../screens/dashboard/cgc";

const Drawer = createDrawerNavigator();

const HomeDrawer = () => {
  return (
    <Drawer.Navigator
      id={undefined}
      initialRouteName="New Releases"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen name="New Releases" component={Home} />
      <Drawer.Screen
        name="Comics"
        component={Home}
        initialParams={{ category_id: 5 }}
      />
      <Drawer.Screen
        name="Graphic Novels"
        component={Home}
        initialParams={{ category_id: 2 }}
      />
      <Drawer.Screen name="CGC" component={CGC} />
    </Drawer.Navigator>
  );
};

export default HomeDrawer;
