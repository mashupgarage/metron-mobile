import React, { FC } from "react";
import { Box } from "../ui/box";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "../ui/form-control";
import { Input, InputField } from "../ui/input";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "../ui/select";
import { Button, ButtonText } from "../ui/button";

interface OnboardingFormProps {
  phone: string;
  branch: string;
  fulfillmentOption: string;
  setPhoneValue: (phone: string) => void;
  setFulfillmentOption: (option: string) => void;
  setBranch: (branch: string) => void;
  size?: "sm" | "md" | "lg";
}

const OnboardingForm: FC<OnboardingFormProps> = ({
  phone,
  fulfillmentOption,
  branch,
  setBranch,
  setPhoneValue,
  setFulfillmentOption,
  size = "md",
}) => {
  const options = ["Pickup", "Delivery"];
  const branches = ["Robinsons Place Galeria"];

  return (
    <Box className="mt-8">
      <FormControl size="md">
        <FormControlLabel>
          <FormControlLabelText>Where can we reach you?</FormControlLabelText>
        </FormControlLabel>
        <Input className="my-1" size={size}>
          <InputField
            type="text"
            testID="onboarding-phone-field"
            autoComplete="tel"
            keyboardType="phone-pad"
            autoCapitalize="none"
            value={phone}
            onChangeText={(text) => {
              setPhoneValue(text);
            }}
          />
        </Input>
      </FormControl>
      <FormControl className="mt-4" size="md">
        <FormControlLabel>
          <FormControlLabelText>
            What is your preferred fulfillment?
          </FormControlLabelText>
        </FormControlLabel>
        <Select
          className="mt-2"
          testID="onboarding-option-field"
          selectedValue={fulfillmentOption}
        >
          <SelectTrigger variant="outline" size="lg">
            <SelectInput placeholder="Select option" />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent className={"min-h-[240px] pt-4"}>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {options.map((option) => (
                <SelectItem
                  key={option}
                  label={option}
                  value={option}
                  onPress={() => {
                    setFulfillmentOption(option);
                  }}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
      </FormControl>
      <FormControl className="mt-4" size="md">
        <FormControlLabel>
          <FormControlLabelText>
            Which branch is nearest to you?
          </FormControlLabelText>
        </FormControlLabel>
        <Select
          testID="onboarding-branch-field"
          className="mt-2"
          selectedValue={branch}
        >
          <SelectTrigger variant="outline" size="lg">
            <SelectInput placeholder="Select option" />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent className={"min-h-[240px] pt-4"}>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {branches.map((option) => (
                <SelectItem
                  key={option}
                  testID="onboarding-option"
                  label={option}
                  value={option}
                  onPress={() => {
                    setBranch(option);
                  }}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
      </FormControl>
    </Box>
  );
};

export default OnboardingForm;
