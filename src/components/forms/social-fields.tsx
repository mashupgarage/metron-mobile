import FacebookIcon from "../icons/svg/facebook";
import GoogleIcon from "../icons/svg/google";
import XIcon from "../icons/svg/x";
import { Button, ButtonGroup, ButtonIcon, ButtonText } from "../ui/button";

const SocialFields = () => {
  return (
    <ButtonGroup testID="social-fields" space="md">
      <Button variant="outline" size="md" className="border-gray-300 mb-4">
        <ButtonIcon as={GoogleIcon} />
        <ButtonText>Sign in with Google</ButtonText>
      </Button>
      <Button variant="outline" size="md" className="border-gray-300 mb-4">
        <ButtonIcon as={FacebookIcon} />
        <ButtonText>Sign in with Facebook</ButtonText>
      </Button>
      <Button variant="outline" size="md" className="border-gray-300 mb-4">
        <ButtonIcon as={XIcon} />
        <ButtonText>Sign in with X/Twitter</ButtonText>
      </Button>
    </ButtonGroup>
  );
};

export default SocialFields;
