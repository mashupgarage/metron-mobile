import { FC, useState } from "react";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "../ui/form-control";
import { VStack } from "../ui/vstack";
import { Text } from "../ui/text";
import { Input, InputField } from "../ui/input";
import { Button, ButtonSpinner, ButtonText } from "../ui/button";
import { HStack } from "../ui/hstack";
import { emailValidator, validatePassword } from "@/src/utils/validators";
import { useBoundStore } from "@/src/store";

interface SignInFormProps {
  email: string;
  setEmailValue: (email: string) => void;
  setPasswordValue: (password: string) => void;
  password: string;
  handleSubmit: (payload: { email: string; password: string }) => void;
  size?: "sm" | "md" | "lg";
}

const SignInForm: FC<SignInFormProps> = ({
  size = "lg",
  email,
  password,
  setEmailValue,
  setPasswordValue,
  handleSubmit,
}) => {
  const store = useBoundStore();
  const isLoading = store.isLoading;

  const [isInvalidEmail, setInvalidEmail] = useState(false);
  const [isInvalidPassword, setInvalidPassword] = useState(false);

  const clearErrors = () => {
    setInvalidEmail(false);
    setInvalidPassword(false);
  };

  return (
    <VStack testID="sign-in-form">
      <FormControl isInvalid={isInvalidEmail} size="md">
        <FormControlLabel>
          <FormControlLabelText>Email Address</FormControlLabelText>
        </FormControlLabel>
        <Input className="my-1" size={size}>
          <InputField
            type="text"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmailValue(text);
              setInvalidEmail(!emailValidator(text));
            }}
          />
        </Input>
        {isInvalidEmail && (
          <FormControlError>
            <FormControlErrorText>Must be a valid email.</FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>

      <FormControl className="mt-4" isInvalid={isInvalidPassword} size="md">
        <FormControlLabel>
          <FormControlLabelText>Password</FormControlLabelText>
        </FormControlLabel>
        <Input className="my-1" size={size}>
          <InputField
            type="password"
            value={password}
            onChangeText={(text) => {
              setPasswordValue(text);
              setInvalidPassword(!validatePassword(text));
            }}
          />
        </Input>
        {isInvalidPassword && (
          <FormControlError>
            <FormControlErrorText>
              Must be at least 6 characters long, contain at least one uppercase
              letter, and at least one special character.
            </FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>
      <HStack className="justify-between">
        <Button variant="link" className="mt-4">
          <Text underline>Forgot Password?</Text>
        </Button>
        <Button
          className="mt-4 rounded-[8px]"
          size={size}
          disabled={isLoading}
          testID="submit-button"
          onPress={() => {
            if (isInvalidEmail || isInvalidPassword) {
              return;
            } else {
              clearErrors();
              handleSubmit({ email, password });
            }
          }}
        >
          <ButtonText>Sign in</ButtonText>
          {isLoading && <ButtonSpinner />}
        </Button>
      </HStack>
    </VStack>
  );
};

export default SignInForm;
