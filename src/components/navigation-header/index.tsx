import { useColorScheme, View } from "react-native"
import { Button, ButtonText } from "../ui/button"
import { useNavigation } from "@react-navigation/native"
import { ArrowLeft, Dot, ShoppingBag } from "lucide-react-native"
import { useBoundStore } from "@/src/store"

const NavigationHeader = ({
  showBackButton = true,
  showCartButton = false,
}) => {
  const navigation = useNavigation()
  const colorScheme = useColorScheme()
  const theme = useBoundStore((state) => state.theme)
  const cartCount = useBoundStore((state) => state.cartItems.length)
  return (
    <View className='mb-4 flex'>
      {showBackButton && (
        <Button
          onPress={() => {
            navigation.goBack()
          }}
          className='absolute ml-4'
          variant='link'
        >
          <ArrowLeft color={theme.text} />
          <ButtonText style={{ fontFamily: "Inter", color: theme.text }}>
            Back
          </ButtonText>
        </Button>
      )}
      <View>
        {showCartButton && (
          <Button
            onPress={() => {
              // @ts-ignore
              navigation.navigate("Home", { screen: "My Cart" })
            }}
            className='absolute right-4'
            variant='link'
          >
            {cartCount > 0 && (
              <Dot
                className='absolute'
                style={{ right: -50, top: -9, zIndex: 1 }}
                color='red'
                size={44}
              />
            )}
            <ShoppingBag color={theme.text} />
            <ButtonText style={{ fontFamily: "Inter", color: theme.text }}>
              My Cart
            </ButtonText>
          </Button>
        )}
      </View>
    </View>
  )
}
export default NavigationHeader
