import React, { useState } from "react"
import {
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StackScreenProps } from "@react-navigation/stack"

import { Box } from "@/src/components/ui/box"
import { Text } from "@/src/components/ui/text"
import { Button, ButtonText } from "@/src/components/ui/button"
import { Input, InputField } from "@/src/components/ui/input"
import { VStack } from "@/src/components/ui/vstack"
import { ChevronDownIcon } from "@/src/components/ui/icon"
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control"
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectItem,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
} from "@/src/components/ui/select"
import NavigationHeader from "@/src/components/navigation-header"
import { fetchUserProfile, updateUserProfile } from "@/src/api/apiEndpoints"
import { useBoundStore } from "@/src/store"
import { fonts } from "@/src/theme"

type DashboardStackParamList = {
  EditProfile: undefined
  Home: undefined
  Product: { id: string }
  WantlistScreen: undefined
  ReservationBoxScreen: undefined
  CGCSubmit: undefined
  Profile: undefined
}

type Props = StackScreenProps<DashboardStackParamList, "EditProfile">

const EditProfile = ({ navigation }: Props) => {
  const store = useBoundStore()
  const theme = useBoundStore((state) => state.theme)
  const fullNameArray = store.user?.full_name.split(" ")
  const ln = fullNameArray.pop()
  const fn = fullNameArray.join(" ")
  // State for form fields
  const [email, setEmail] = useState(store.user?.email || "")
  const [firstName, setFirstName] = useState(fn)
  const [lastName, setLastName] = useState(ln)
  const [contactNumber, setContactNumber] = useState(
    store.user?.contact_number || ""
  )
  const [branch, setBranch] = useState("Robinsons Galleria")
  const [fulfillment, setFulfillment] = useState("store")
  const [branches, setBranches] = useState(["Robinsons Galleria"])

  // Mock data for dropdowns
  const fulfillmentOptions = ["store", "delivery"]

  const handleUpdate = async () => {
    const res = await updateUserProfile(store.user.id, {
      user: {
        first_name: firstName,
        last_name: lastName,
        contact_number: contactNumber,
        branch_id: 1,
      },
    })
    if (res.status === 200) {
      console.log("SUCCESS", res.data)
      fetchUserProfile(store.user.id).then((res) => {
        store.setUser(res.data)
        navigation.goBack()
      })
    } else {
      console.log("failed to update profile")
    }
  }

  return (
    <SafeAreaView
      className={"flex-1"}
      style={{ backgroundColor: theme.background }}
    >
      <NavigationHeader />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 32 : 0}
      >
        <StatusBar
          barStyle={
            useColorScheme() === "dark" ? "light-content" : "dark-content"
          }
        />

        <ScrollView className='flex-1'>
          <Box className='p-5'>
            <Text
              style={[fonts.title, { color: theme.text }]}
              className='text-2xl font-semibold mb-6 mt-4'
            >
              Edit Account
            </Text>

            <VStack className='space-y-4 w-full'>
              {/* Email Field */}
              <FormControl className='mb-4'>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: theme.text }}>
                    Email
                  </FormControlLabelText>
                </FormControlLabel>
                <Input size='xl' className='my-1'>
                  <InputField
                    placeholder='Email'
                    value={email}
                    onChangeText={setEmail}
                    keyboardType='email-address'
                    autoCapitalize='none'
                  />
                </Input>
              </FormControl>

              {/* First Name Field */}
              <FormControl className='mb-4'>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: theme.text }}>
                    First name
                  </FormControlLabelText>
                </FormControlLabel>
                <Input size='xl' className='my-1'>
                  <InputField
                    placeholder='First name'
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </Input>
              </FormControl>

              {/* Last Name Field */}
              <FormControl className='mb-4'>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: theme.text }}>
                    Last name
                  </FormControlLabelText>
                </FormControlLabel>
                <Input size='xl' className='my-1'>
                  <InputField
                    placeholder='Last name'
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </Input>
              </FormControl>

              {/* Contact Number Field */}
              <FormControl className='mb-4'>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: theme.text }}>
                    Contact number
                  </FormControlLabelText>
                </FormControlLabel>
                <Input size='xl' className='my-1'>
                  <InputField
                    placeholder='Contact number'
                    value={contactNumber}
                    onChangeText={setContactNumber}
                    keyboardType='phone-pad'
                  />
                </Input>
              </FormControl>

              {/* Branch Selection */}
              <FormControl className='mb-4'>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: theme.text }}>
                    Branch
                  </FormControlLabelText>
                </FormControlLabel>
                <Select
                  className='mt-2'
                  selectedValue={branch}
                  onValueChange={(value) => setBranch(value)}
                >
                  <SelectTrigger size='xl'>
                    <SelectInput placeholder='Select branch' />
                    <SelectIcon className='mr-3'>
                      <ChevronDownIcon />
                    </SelectIcon>
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectContent className={"min-h-[240px] pt-4"}>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {branches.map((item) => (
                        <SelectItem key={item} label={item} value={item} />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </FormControl>

              {/* Default Fulfillment Option */}
              <FormControl className='mb-6'>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: theme.text }}>
                    Fulfillment Option
                  </FormControlLabelText>
                </FormControlLabel>
                <Select
                  className='mt-2'
                  selectedValue={fulfillment}
                  defaultValue='store'
                  isDisabled
                  onValueChange={(value) => setFulfillment(value)}
                >
                  <SelectTrigger size='xl'>
                    <SelectInput placeholder='Select fulfillment option' />
                    <SelectIcon className='mr-3'>
                      <ChevronDownIcon color={theme.text} />
                    </SelectIcon>
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectContent className={"min-h-[240px] pt-4"}>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {fulfillmentOptions.map((item) => (
                        <SelectItem key={item} label={item} value={item} />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </FormControl>
            </VStack>
          </Box>
        </ScrollView>
        <Button
          size='xl'
          className='ml-4 mr-4 mb-4'
          style={{ backgroundColor: theme.primary[500] }}
          onPress={handleUpdate}
        >
          <ButtonText style={{ color: theme.white }}>Update</ButtonText>
        </Button>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default EditProfile
