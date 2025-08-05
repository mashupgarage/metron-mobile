import React, { useEffect, useState } from "react"
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
import { fetchUserProfile, fetchUserShippingAddress, updateUserProfile, createShippingAddress } from "@/src/api/apiEndpoints"
import { useBoundStore } from "@/src/store"
import { fonts } from "@/src/theme"
import { ShippingAddressT } from "@/src/utils/types/common"

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
  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddressT[]>([])
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>("")
  const [showAddAddressForm, setShowAddAddressForm] = useState(false)

  // Form fields for new shipping address
  const [region, setRegion] = useState("")
  const [houseNumber, setHouseNumber] = useState("")
  const [streetName, setStreetName] = useState("")
  const [building, setBuilding] = useState("")
  const [barangay, setBarangay] = useState("")
  const [city, setCity] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [country, setCountry] = useState("")

  // Mock data for dropdowns
  const fulfillmentOptions = ["store", "delivery"]

  const handleUpdate = async () => {
    // If fulfillment is delivery and a shipping address is selected, include it in the update
    let updateData: any = {
      user: {
        first_name: firstName,
        last_name: lastName,
        contact_number: contactNumber,
        branch_id: 1,
        default_fulfillment: fulfillment
      }
    };

    // Add shipping address if fulfillment is delivery and an address is selected
    if (fulfillment === "delivery" && selectedShippingAddress) {
      // Check if selectedShippingAddress is already a full address string
      if (selectedShippingAddress.includes(",")) {
        // It's already a full address string
        updateData.user.shipping_address = selectedShippingAddress;
      } else {
        // It's an ID, find the address and format it
        const selectedAddress = shippingAddresses.find((addr) => addr.id.toString() === selectedShippingAddress);
        if (selectedAddress) {
          updateData.user.shipping_address = selectedAddress.full_address;
        }
      }
    }

    console.log("to update", updateData)
    const res = await updateUserProfile(store.user.id, updateData);
    if (res.status === 200) {
      console.log("SUCCESS", res.data);
      fetchUserProfile(store.user.id).then((res) => {
        store.setUser(res.data);
        navigation.goBack();
      });
    } else {
      console.log("failed to update profile");
    }
  }


  useEffect(() => {
    fetchUserProfile(store.user.id).then((res) => {
      console.log("SUCCESS USER", res.data)
      store.setUser(res.data)
    })
    fetchUserShippingAddress(store.user.id).then((res) => {
      console.log("SUCCESS", res.data)
      setShippingAddresses(res.data)
      // If there are shipping addresses, select the first one by default
      if (res.data && res.data.length > 0) {
        const address = res.data[0]
        setSelectedShippingAddress(`${address.house_number} ${address.street_name} ${address.barangay} ${address.city}, region ${address.region} ${address.country}`)
      }
    }).catch((err) => {
      console.log("ERROR", err)
    })
  }, [])

  return (
    <SafeAreaView
      className={"flex-1"}
      style={{ backgroundColor: theme.background }}
    >
      <Box className="h-8" style={{ backgroundColor: theme.background }}>
      <NavigationHeader />
      </Box>
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
              Edit Profile
            </Text>

            <VStack className='space-y-4 w-full'>
              {/* Email Field */}
              <FormControl className='mb-4'>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: theme.text, ...fonts.label, fontWeight: 'normal' }}>
                    Email
                  </FormControlLabelText>
                </FormControlLabel>
                <Input isDisabled size='xl' className='my-1'>
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
                  <FormControlLabelText style={{ color: theme.text, ...fonts.label, fontWeight: 'normal' }}>
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
                  <FormControlLabelText style={{ color: theme.text, ...fonts.label, fontWeight: 'normal' }}>
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
                  <FormControlLabelText style={{ color: theme.text, ...fonts.label, fontWeight: 'normal' }}>
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
                  <FormControlLabelText style={{ color: theme.text, ...fonts.label, fontWeight: 'normal' }}>
                    Branch
                  </FormControlLabelText>
                </FormControlLabel>
                <Select
                  className='mt-2'
                  selectedValue={branch}
                  isDisabled
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
                  <FormControlLabelText style={{ color: theme.text, ...fonts.label, fontWeight: 'normal' }}>
                    Fulfillment Option
                  </FormControlLabelText>
                </FormControlLabel>
                <Select
                  className='mt-2'
                  selectedValue={fulfillment}
                  defaultValue='store'
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
                        <SelectItem key={item} label={item.toLocaleUpperCase()} value={item} />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </FormControl>

              {/* Shipping Address Section - Only show when fulfillment is delivery */}
              {fulfillment === "delivery" && (
                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText style={{ color: theme.text, ...fonts.label, fontWeight: 'normal' }}>
                      Shipping Address
                    </FormControlLabelText>
                  </FormControlLabel>
                  {shippingAddresses.length === 0 ? (
                    <Button 
                      variant="outline" 
                      size='md' 
                      className='mt-2 h-12'
                      onPress={() => navigation.navigate("AddShippingAddress" as never)}
                    >
                      <ButtonText style={{ color: theme.text, ...fonts.label, fontWeight: '600' }}>Add Shipping Address</ButtonText>
                    </Button>
                  ) : (
                    <>
                      <Select onValueChange={(value) => setSelectedShippingAddress(value)} className="overflow-hidden" selectedValue={selectedShippingAddress}>
                        <SelectTrigger variant="outline" size="lg" className='mt-1 h-12 overflow-hidden'>
                          <SelectInput placeholder="Select shipping address" />
                          <SelectIcon as={ChevronDownIcon} />
                        </SelectTrigger>
                        <SelectPortal>
                          <SelectContent className="min-h-[240px] pt-4">
                            {shippingAddresses.map((address) => (
                              <SelectItem 
                                key={address.id}
                                label={`${address.house_number} ${address.street_name} ${address.barangay} ${address.city}, region ${address.region} ${address.country}`} 
                                value={address.id.toString()} 
                              />
                            ))}
                          </SelectContent>
                        </SelectPortal>
                      </Select>
                      <Button 
                        variant="outline" 
                        size='md' 
                        className='mt-2 h-12'
                        onPress={() => navigation.navigate("AddShippingAddress" as never)}
                      >
                        <ButtonText style={{ color: theme.text, ...fonts.label, fontWeight: '600' }}>Add New Address</ButtonText>
                      </Button>
                    </>
                  )}
                </FormControl>
              )}
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
