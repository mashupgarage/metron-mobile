import FacebookIcon from "../icons/svg/facebook"
import GoogleIcon from "../icons/svg/google"
import XIcon from "../icons/svg/x"
import { Button, ButtonGroup, ButtonIcon, ButtonText } from "../ui/button"
import { useBoundStore } from "@/src/store"
import { fonts } from "@/src/theme"

const SocialFields = () => {
  const theme = useBoundStore((state) => state.theme)
  return (
    <ButtonGroup testID='social-fields' space='md'>
      <Button variant='outline' size='md' className='border-gray-300 mb-4'>
        <ButtonIcon as={GoogleIcon} />
        <ButtonText style={[fonts.body, { color: theme.text }]}>
          Sign in with Google
        </ButtonText>
      </Button>
      <Button variant='outline' size='md' className='border-gray-300 mb-4'>
        <ButtonIcon as={FacebookIcon} />
        <ButtonText style={[fonts.body, { color: theme.text }]}>
          Sign in with Facebook
        </ButtonText>
      </Button>
      <Button variant='outline' size='md' className='border-gray-300 mb-4'>
        <ButtonIcon as={XIcon} />
        <ButtonText style={[fonts.body, { color: theme.text }]}>
          Sign in with X/Twitter
        </ButtonText>
      </Button>
    </ButtonGroup>
  )
}

export default SocialFields
