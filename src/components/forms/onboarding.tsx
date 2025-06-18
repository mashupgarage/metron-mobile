import React, { FC } from "react"
import { Box } from "../ui/box"
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "../ui/form-control"
import { Input, InputField } from "../ui/input"
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
} from "../ui/select"
import { Button, ButtonText } from "../ui/button"
import { fonts } from "@/src/theme"
import { useBoundStore } from "@/src/store"

interface OnboardingFormProps {
  phone: string
  branch: string
  fulfillmentOption: string
  setPhoneValue: (phone: string) => void
  setFulfillmentOption: (option: string) => void
  setBranch: (branch: string) => void
  size?: "sm" | "md" | "lg"
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
  const theme = useBoundStore((state) => state.theme)
  const options = ["store", "delivery"]
  const branches = ["Robinsons Place Galeria"]

  return (
    <Box className='mt-8'>
      <FormControl size='md'>
        <FormControlLabel>
          <FormControlLabelText style={[fonts.body, { color: theme.text }]}>
            Where can we reach you?
          </FormControlLabelText>
        </FormControlLabel>
        <Input className='my-1' size={size}>
          <InputField
            type='text'
            testID='onboarding-phone-field'
            autoComplete='tel'
            keyboardType='phone-pad'
            autoCapitalize='none'
            value={phone}
            onChangeText={(text) => {
              setPhoneValue(text)
            }}
          />
        </Input>
      </FormControl>
      <FormControl className='mt-4' size='md'>
        <FormControlLabel>
          <FormControlLabelText style={[fonts.body, { color: theme.text }]}>
            What is your preferred fulfillment?
          </FormControlLabelText>
        </FormControlLabel>
        <Select
          className='mt-2'
          testID='onboarding-option-field'
          selectedValue={fulfillmentOption}
        >
          <SelectTrigger variant='outline' size='lg'>
            <SelectInput placeholder='Select option' />
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
                  label={option.toLocaleUpperCase()}
                  value={option}
                  onPress={() => {
                    setFulfillmentOption(option)
                  }}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
      </FormControl>
      <FormControl className='mt-4' size='md'>
        <FormControlLabel>
          <FormControlLabelText style={[fonts.body, { color: theme.text }]}>
            Which branch is nearest to you?
          </FormControlLabelText>
        </FormControlLabel>
        <Select
          testID='onboarding-branch-field'
          className='mt-2'
          selectedValue={branch}
        >
          <SelectTrigger variant='outline' size='lg'>
            <SelectInput placeholder='Select option' />
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
                  testID='onboarding-option'
                  label={option}
                  value={option}
                  onPress={() => {
                    setBranch(option)
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
  )
}

export default OnboardingForm
