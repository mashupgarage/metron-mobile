import { Box } from "@/src/components/ui/box"
import { Button, ButtonText } from "@/src/components/ui/button"
import { useBoundStore } from "@/src/store"
import { fonts } from "@/src/theme"
import { ArrowLeft } from "lucide-react-native"
import React from "react"
import { ScrollView, useColorScheme } from "react-native"

const AuthLayout = ({
  children,
  showBackButton = false,
  ...props
}: {
  children: React.ReactElement
  showBackButton: boolean
  navigation: any
}) => {
  const theme = useBoundStore((state) => state.theme)
  return (
    <ScrollView
      style={{
        backgroundColor: theme.background,
      }}
    >
      {showBackButton && (
        <Button
          onPress={() => {
            props.navigation.replace("Dashboard", { screen: "Home" })
          }}
          className='absolute ml-4 top-16 p-0'
          variant='link'
        >
          <ArrowLeft color={theme.text} />
          <ButtonText style={[fonts.body, { color: theme.text }]}>
            Back
          </ButtonText>
        </Button>
      )}
      <Box className='pt-16 mt-24 p-4 pb-12'>{children}</Box>
    </ScrollView>
  )
}

export default AuthLayout
