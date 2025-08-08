import React, { useState } from "react"
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StackScreenProps } from "@react-navigation/stack"

import { Box } from "@/src/components/ui/box"
import { Text } from "@/src/components/ui/text"
import { Button, ButtonText } from "@/src/components/ui/button"
import { Input, InputField } from "@/src/components/ui/input"
import { VStack } from "@/src/components/ui/vstack"
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control"
import NavigationHeader from "@/src/components/navigation-header"
import { createShippingAddress, fetchUserShippingAddress } from "@/src/api/apiEndpoints"
import { useBoundStore } from "@/src/store"
import { fonts } from "@/src/theme"

type ProfileStackParamList = {
  AddShippingAddress: undefined
  EditProfile: undefined
}

type Props = StackScreenProps<ProfileStackParamList, "AddShippingAddress">

const AddShippingAddressScreen = ({ navigation }: Props) => {
  const store = useBoundStore()
  const theme = useBoundStore((state) => state.theme)

  // Form fields for new shipping address
  const [region, setRegion] = useState("")
  const [houseNumber, setHouseNumber] = useState("")
  const [streetName, setStreetName] = useState("")
  const [building, setBuilding] = useState("")
  const [barangay, setBarangay] = useState("")
  const [city, setCity] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [country, setCountry] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreateShippingAddress = async () => {
    if (!region || !houseNumber || !streetName || !barangay || !city || !zipCode || !country) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const addressData = {
        region: region,
        house_number: houseNumber,
        street_name: streetName,
        building: building,
        barangay: barangay,
        city: city,
        zip_code: zipCode,
        country: country,
        address_type: "shipping",
        full_address: `${building ? building + ', ' : ''}${houseNumber} ${streetName} ${barangay} ${city}, region ${region} ${country} ${zipCode}`
      }

      const res = await createShippingAddress(store.user.id, addressData)
      if (res.status === 200 || res.status === 201) {
        console.log("Shipping address created successfully", res.data)
        Alert.alert(
          "Success",
          "Shipping address added successfully",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack()
            }
          ]
        )
      }
    } catch (error) {
      console.log("Error creating shipping address", error)
      Alert.alert("Error", "Failed to create shipping address")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Box className="h-8" style={{ backgroundColor: theme.background }}>
        <NavigationHeader />
      </Box>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, marginTop: 12 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
          }}
          className='px-4'
          >
          <Box>
          <Text style={{ ...fonts.title, color: theme.text, marginBottom: 8 }}>
          Add Shipping Address
        </Text>
            <VStack space="md" className='mt-4'>
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: theme.text, ...fonts.label, fontWeight: 'normal' }}>
                    Region
                  </FormControlLabelText>
                </FormControlLabel>
                <Input size='xl' className='my-1'>
                  <InputField
                    placeholder='Region'
                    value={region}
                    onChangeText={setRegion}
                  />
                </Input>
              </FormControl>
              
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: theme.text, ...fonts.label, fontWeight: 'normal' }}>
                    House Number
                  </FormControlLabelText>
                </FormControlLabel>
                <Input size='xl' className='my-1'>
                  <InputField
                    placeholder='House Number'
                    value={houseNumber}
                    onChangeText={setHouseNumber}
                  />
                </Input>
              </FormControl>
              
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: theme.text, ...fonts.label, fontWeight: 'normal' }}>
                    Street Name
                  </FormControlLabelText>
                </FormControlLabel>
                <Input size='xl' className='my-1'>
                  <InputField
                    placeholder='Street Name'
                    value={streetName}
                    onChangeText={setStreetName}
                  />
                </Input>
              </FormControl>
              
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: theme.text, ...fonts.label, fontWeight: 'normal' }}>
                    Building/Apartment
                  </FormControlLabelText>
                </FormControlLabel>
                <Input size='xl' className='my-1'>
                  <InputField
                    placeholder='Building/Apartment'
                    value={building}
                    onChangeText={setBuilding}
                  />
                </Input>
              </FormControl>
              
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: theme.text, ...fonts.label, fontWeight: 'normal' }}>
                    Barangay
                  </FormControlLabelText>
                </FormControlLabel>
                <Input size='xl' className='my-1'>
                  <InputField
                    placeholder='Barangay'
                    value={barangay}
                    onChangeText={setBarangay}
                  />
                </Input>
              </FormControl>
              
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: theme.text, ...fonts.label, fontWeight: 'normal' }}>
                    City
                  </FormControlLabelText>
                </FormControlLabel>
                <Input size='xl' className='my-1'>
                  <InputField
                    placeholder='City'
                    value={city}
                    onChangeText={setCity}
                  />
                </Input>
              </FormControl>
              
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: theme.text, ...fonts.label, fontWeight: 'normal' }}>
                    ZIP Code
                  </FormControlLabelText>
                </FormControlLabel>
                <Input size='xl' className='my-1'>
                  <InputField
                    placeholder='ZIP Code'
                    value={zipCode}
                    onChangeText={setZipCode}
                    keyboardType='numeric'
                  />
                </Input>
              </FormControl>
              
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: theme.text, ...fonts.label, fontWeight: 'normal' }}>
                    Country
                  </FormControlLabelText>
                </FormControlLabel>
                <Input size='xl' className='my-1'>
                  <InputField
                    placeholder='Country'
                    value={country}
                    onChangeText={setCountry}
                  />
                </Input>
              </FormControl>
              <Box className='mt-4' />
            </VStack>
          </Box>
        </ScrollView>
        <Button
          size='xl'
          className='ml-4 mr-4 mb-4'
          style={{ backgroundColor: theme.primary[500] }}
          onPress={handleCreateShippingAddress}
          disabled={loading}
        >
          <ButtonText style={{ color: theme.white }}>
            {loading ? "Saving..." : "Save Address"}
          </ButtonText>
        </Button>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default AddShippingAddressScreen
