import { createDrawerNavigator } from "@react-navigation/drawer";
import Home from "../screens/dashboard/home";
import CGC from "../screens/dashboard/cgc";
import { useBoundStore } from "../store";

const Drawer = createDrawerNavigator();

const HomeDrawer = () => {
  const theme = useBoundStore((state) => state.theme)
  return (
    <Drawer.Navigator
      id={undefined}
      initialRouteName="Marketplace"
      screenOptions={{
        headerShown: false,
        drawerContentStyle: [
          {backgroundColor: theme.background}
        ],
        drawerLabelStyle: {
          color: theme.text,
        },
      }}
    >
      <Drawer.Screen name="Marketplace" component={Home} />
      <Drawer.Screen name="CGC" component={CGC} />
    </Drawer.Navigator>
  );
};

export default HomeDrawer;
