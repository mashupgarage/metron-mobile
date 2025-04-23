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
import { Button, ButtonText } from "../ui/button";
import { HStack } from "../ui/hstack";
import { KeyboardAvoidingView } from "react-native";
import { emailValidator, validatePassword } from "@/src/utils/validators";

interface SignUpFormProps {
  email: string;
  setEmailValue: (email: string) => void;
  setPasswordValue: (password: string) => void;
  password: string;
  fullName: string;
  setFullNameValue: (fullName: string) => void;
  handleSubmit: (payload: {
    email: string;
    password: string;
    fullName: string;
  }) => void;
  size?: "sm" | "md" | "lg";
}

const SignUpForm: FC<SignUpFormProps> = ({
  size = "lg",
  email,
  password,
  fullName,
  setFullNameValue,
  setEmailValue,
  setPasswordValue,
  handleSubmit,
}) => {
  const errorMsg =
    "Must be a at least 6 characters long, contains at least one, uppercase letter with at least one special character.";
  const [retypedPassword, setRetypedPassword] = useState<string>("");

  const [isInvalidEmail, setInvalidEmail] = useState(false);
  const [isInvalidPassword, setInvalidPassword] = useState(false);
  const [isPassowrdNotMatch, setIsPasswordNotMatch] = useState(false);

  const clearErrors = () => {
    setInvalidEmail(false);
    setInvalidPassword(false);
    setIsPasswordNotMatch(false);
  };

  return (
    <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={70}>
      <VStack testID="sign-up-form">
        <FormControl isRequired isInvalid={isInvalidEmail} size="md">
          <FormControlLabel>
            <FormControlLabelText>Email Address</FormControlLabelText>
          </FormControlLabel>
          <Input className="my-1" size={size}>
            <InputField
              type="text"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                emailValidator(text)
                  ? setInvalidEmail(false)
                  : setInvalidEmail(true);
                setEmailValue(text);
              }}
            />
          </Input>
          <FormControlError>
            <FormControlErrorText>Must be a valid email.</FormControlErrorText>
          </FormControlError>
        </FormControl>
        <FormControl isRequired className="mt-4" size="md">
          <FormControlLabel>
            <FormControlLabelText>Full Name</FormControlLabelText>
          </FormControlLabel>
          <Input className="my-1" size={size}>
            <InputField
              type="text"
              value={fullName}
              onChangeText={(text) => {
                setFullNameValue(text);
              }}
            />
          </Input>
          <FormControlError>
            <FormControlErrorText>full name is required.</FormControlErrorText>
          </FormControlError>
        </FormControl>
        <FormControl
          isRequired
          className="mt-4"
          isInvalid={isInvalidPassword}
          size="md"
        >
          <FormControlLabel>
            <FormControlLabelText>Password</FormControlLabelText>
          </FormControlLabel>
          <Input className="my-1" size={size}>
            <InputField
              type="password"
              value={password}
              onChangeText={(text) => {
                validatePassword(text)
                  ? setInvalidPassword(false)
                  : setInvalidPassword(true);
                setPasswordValue(text);
              }}
            />
          </Input>
          <FormControlError>
            <FormControlErrorText>{errorMsg}</FormControlErrorText>
          </FormControlError>
        </FormControl>
        <FormControl
          isRequired
          className="mt-4"
          isInvalid={retypedPassword !== password}
          size="md"
        >
          <FormControlLabel>
            <FormControlLabelText>Re-enter your Password</FormControlLabelText>
          </FormControlLabel>
          <Input className="my-1" size={size}>
            <InputField
              type="password"
              value={retypedPassword}
              onChangeText={(text) => {
                setRetypedPassword(text);
              }}
            />
          </Input>
          <FormControlError>
            <FormControlErrorText>Password does not match</FormControlErrorText>
          </FormControlError>
        </FormControl>
        <HStack className="justify-between">
          <Button
            className="mt-4 w-full rounded-[8px]"
            size={size}
            testID="submit-button"
            onPress={() => {
              clearErrors();
              if (
                emailValidator(email) &&
                validatePassword(password) &&
                retypedPassword === password
              ) {
                handleSubmit({ email, password, fullName });
              } else {
                if (!emailValidator(email)) {
                  setInvalidEmail(true);
                }
                if (!validatePassword(password)) {
                  setInvalidPassword(true);
                }
                if (retypedPassword !== password) {
                  setIsPasswordNotMatch(true);
                }
              }
            }}
          >
            <ButtonText>Sign up</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </KeyboardAvoidingView>
  );
};

export default SignUpForm;
