import React, { useState, useMemo } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { View, Text, ScrollView, Pressable } from "react-native"
import * as Clipboard from "expo-clipboard"
import { useNavigation } from "@react-navigation/native"
import { useBoundStore } from "@/src/store"
import { Button, ButtonText } from "@/src/components/ui/button"
import { Input, InputField } from "@/src/components/ui/input"
import { Textarea, TextareaInput } from "@/src/components/ui/textarea"
import { Toast, ToastTitle, useToast } from "@/src/components/ui/toast"
import { checkoutCartItems } from "@/src/api/apiEndpoints"
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control"
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
} from "@/src/components/ui/select"
import {
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioLabel,
  RadioIcon,
} from "@/src/components/ui/radio"
import { CircleIcon } from "lucide-react-native"
import NavigationHeader from "@/src/components/navigation-header"
import { StatusBar } from "expo-status-bar"
// Type for the checkout form state

interface CheckoutFormState {
  notes: string
  branch: string
  phone_number: string
  shipping_region: string
  shipping_address: string
  discount_total: number
  sub_total_price: number
  total_price: number
  delivery_option: "shipping" | "store"
  shipping_total: number
  transaction_source: "paypal" | "bank_deposit" | "cod" | "pay_at_store"
  status: "pending"
}

export default function CheckoutScreen({ route }: any) {
  // Form errors state for validation messages
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof CheckoutFormState, string>>
  >({})
  const store = useBoundStore()
  const theme = useBoundStore((state) => state.theme)
  const navigation = useNavigation()
  const toast = useToast()
  const cartItems = useMemo(() => store.cartItems || [], [store.cartItems])
  const user = store.user

  // Calculate prices
  const subTotal = useMemo(
    () =>
      cartItems.reduce((sum: number, item: any) => sum + Number(item.price), 0),
    [cartItems]
  )
  const [deliveryOption, setDeliveryOption] = useState<string>("Store Pick-up")
  const [transactionSource, setTransactionSource] = useState<
    "paypal" | "bank_deposit" | "cod" | "pay_at_store"
  >("pay_at_store")
  const shippingTotal = 0
  const discountTotal = 0
  const totalPrice = subTotal + shippingTotal - discountTotal

  // Prefill user data
  const [form, setForm] = useState<CheckoutFormState>({
    notes: "",
    branch: user?.branch_name || "",
    phone_number: user?.contact_number || "",
    shipping_region: user?.shipping_region || "",
    shipping_address: user?.shipping_address || user?.primary_address || "",
    discount_total: discountTotal,
    sub_total_price: subTotal,
    total_price: totalPrice,
    delivery_option: deliveryOption as "shipping" | "store",
    shipping_total: shippingTotal,
    transaction_source: transactionSource,
    status: "pending",
  })

  // Sync form with delivery/payment option and price changes
  React.useEffect(() => {
    setForm((prev) => ({
      ...prev,
      delivery_option: deliveryOption as "shipping" | "store",
      transaction_source: transactionSource,
      shipping_total: shippingTotal,
      discount_total: discountTotal,
      sub_total_price: subTotal,
      total_price: totalPrice,
    }))
  }, [
    deliveryOption,
    transactionSource,
    shippingTotal,
    discountTotal,
    subTotal,
    totalPrice,
  ])

  const handleChange = (key: keyof CheckoutFormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.show({
        placement: "top",
        render: ({ id }: any) => (
          <Toast nativeID={"toast-" + id} action='error'>
            <ToastTitle>Please log in to proceed with checkout.</ToastTitle>
          </Toast>
        ),
      })
      navigation.navigate("Auth" as never)
      return
    }
    // Validation (add more as needed)
    // if (
    //   !form.phone_number ||
    //   (deliveryOption === "shipping" &&
    //     (!form.shipping_address || !form.shipping_region))
    // ) {
    //   toast.show({
    //     placement: "top",
    //     render: ({ id }: any) => (
    //       <Toast nativeID={"toast-" + id} action='error'>
    //         <ToastTitle>Fill all required fields.</ToastTitle>
    //       </Toast>
    //     ),
    //   })
    //   return
    // }
    try {
      console.log({ ...form, delivery_option: "store" })
      await checkoutCartItems(user.id, {
        order: { ...form, delivery_option: "store" } as any,
      })
      toast.show({
        placement: "top",
        render: ({ id }: any) => (
          <Toast nativeID={"toast-" + id} action='success'>
            <ToastTitle>Order placed successfully!</ToastTitle>
          </Toast>
        ),
      })
      store.setCartItems([]) // Clear cart
      navigation.navigate("Home" as never)
    } catch (err: any) {
      console.log(err)
      toast.show({
        placement: "top",
        render: ({ id }: any) => (
          <Toast nativeID={"toast-" + id} action='error'>
            <ToastTitle>Checkout failed. Please try again.</ToastTitle>
          </Toast>
        ),
      })
    }
  }
  const options = ["Store Pick-up"]

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style={store.isDark ? "light" : "dark"} />
      <NavigationHeader />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 16,
            fontFamily: "Inter",
            color: theme.text,
          }}
        >
          Order Confirmation
        </Text>
        {/* Delivery Option */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{ fontWeight: "bold", marginBottom: 8, color: theme.text }}
          >
            Delivery Option
          </Text>
          <Select>
            <SelectTrigger variant='outline' size='lg'>
              <SelectInput
                value={deliveryOption}
                // @ts-ignore
                onChange={(e: { target: { value: string } }) => {
                  console.log(e.target.value)
                  if (e.target.value === "Store Pick-up") {
                    setDeliveryOption("store")
                  } else {
                    setDeliveryOption("shipping")
                  }
                }}
                placeholder='Select option'
              />
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
                    testID='onboarding-option'
                    label={option}
                    value={option}
                    onPress={() => {
                      setDeliveryOption(option as "store" | "shipping")
                    }}
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        </View>
        {/* Shipping / Branch Fields */}
        {deliveryOption === "shipping" ? (
          <View>
            <View style={{ marginBottom: 8 }}>
              <FormControl isInvalid={!!formErrors.shipping_address} size='md'>
                <FormControlLabel>
                  <FormControlLabelText>Shipping Address</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    type='text'
                    value={form.shipping_address}
                    placeholder='Enter shipping address'
                    onChangeText={(v) => {
                      handleChange("shipping_address", v)
                      if (!v) {
                        setFormErrors((prev) => ({
                          ...prev,
                          shipping_address: "Shipping address is required.",
                        }))
                      } else {
                        setFormErrors((prev) => ({
                          ...prev,
                          shipping_address: undefined,
                        }))
                      }
                    }}
                    autoCapitalize='none'
                  />
                </Input>
                {!!formErrors.shipping_address && (
                  <FormControlError>
                    <FormControlErrorText>
                      {formErrors.shipping_address}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>
            </View>
            <View style={{ marginBottom: 8 }}>
              <FormControl isInvalid={!!formErrors.shipping_region} size='md'>
                <FormControlLabel>
                  <FormControlLabelText>Region</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    type='text'
                    value={form.shipping_region}
                    placeholder='Enter region'
                    onChangeText={(v) => {
                      handleChange("shipping_region", v)
                      if (!v) {
                        setFormErrors((prev) => ({
                          ...prev,
                          shipping_region: "Region is required.",
                        }))
                      } else {
                        setFormErrors((prev) => ({
                          ...prev,
                          shipping_region: undefined,
                        }))
                      }
                    }}
                    autoCapitalize='none'
                  />
                </Input>
                {!!formErrors.shipping_region && (
                  <FormControlError>
                    <FormControlErrorText>
                      {formErrors.shipping_region}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>
            </View>
          </View>
        ) : (
          <View style={{ marginBottom: 8 }}>
            <FormControl isInvalid={!!formErrors.branch} size='md'>
              <FormControlLabel>
                <FormControlLabelText>Branch</FormControlLabelText>
              </FormControlLabel>
              <Input isDisabled={deliveryOption === "Store Pick-up"}>
                <InputField
                  type='text'
                  value={form.branch}
                  placeholder='Enter branch name'
                  onChangeText={(v) => {
                    handleChange("branch", v)
                    if (!v) {
                      setFormErrors((prev) => ({
                        ...prev,
                        branch: "Branch is required.",
                      }))
                    } else {
                      setFormErrors((prev) => ({ ...prev, branch: undefined }))
                    }
                  }}
                  autoCapitalize='none'
                />
              </Input>
              {!!formErrors.branch && (
                <FormControlError>
                  <FormControlErrorText>
                    {formErrors.branch}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>
          </View>
        )}
        <View style={{ marginBottom: 8 }}>
          <FormControl isInvalid={!!formErrors.phone_number} size='md'>
            <FormControlLabel>
              <FormControlLabelText>Phone Number</FormControlLabelText>
            </FormControlLabel>
            <Input>
              <InputField
                type='text'
                value={form.phone_number}
                placeholder='Enter phone number'
                onChangeText={(v) => {
                  handleChange("phone_number", v)
                  // Basic phone validation: must be 10-15 digits, adjust as needed
                  if (!/^\d{10,15}$/.test(v)) {
                    setFormErrors((prev) => ({
                      ...prev,
                      phone_number: "Must be a valid phone number.",
                    }))
                  } else {
                    setFormErrors((prev) => ({
                      ...prev,
                      phone_number: undefined,
                    }))
                  }
                }}
                autoCapitalize='none'
              />
            </Input>
            {!!formErrors.phone_number && (
              <FormControlError>
                <FormControlErrorText>
                  {formErrors.phone_number}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>
        </View>
        <View style={{ marginBottom: 16 }}>
          <FormControl isInvalid={!!formErrors.notes} size='md'>
            <FormControlLabel>
              <FormControlLabelText>Notes</FormControlLabelText>
            </FormControlLabel>
            <Textarea size='md'>
              <TextareaInput
                value={form.notes}
                numberOfLines={3}
                onChangeText={(v) => {
                  handleChange("notes", v)
                  if (!v) {
                    setFormErrors((prev) => ({
                      ...prev,
                      notes: "Notes are required.",
                    }))
                  } else {
                    setFormErrors((prev) => ({ ...prev, notes: undefined }))
                  }
                }}
              />
            </Textarea>
            {!!formErrors.notes && (
              <FormControlError>
                <FormControlErrorText>{formErrors.notes}</FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>
        </View>
        {/* Payment Method */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontWeight: "bold",
              marginBottom: 8,
              fontSize: 16,
              color: theme.text,
            }}
          >
            Payment Method
          </Text>
          <RadioGroup
            value={transactionSource}
            onChange={(val) =>
              setTransactionSource(
                val as "paypal" | "bank_deposit" | "cod" | "pay_at_store"
              )
            }
          >
            <Radio value='bank_deposit' size='md'>
              <RadioIndicator>
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
              <RadioLabel>Bank Deposit</RadioLabel>
            </Radio>
            <Radio value='pay_at_store' size='md'>
              <RadioIndicator>
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
              <RadioLabel>Pay at Store</RadioLabel>
            </Radio>
          </RadioGroup>
        </View>
        {transactionSource === "bank_deposit" && (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontWeight: "bold",
                marginBottom: 8,
                fontSize: 16,
                color: theme.text,
              }}
            >
              Instructions to pay via bank
            </Text>
            <Text style={{ marginBottom: 8, color: theme.text }}>
              Deposit the total order amount to any of these bank accounts near
              you then upload a picture of the deposit slip, using the following
              details:
            </Text>
            <View
              style={{
                flexDirection: "column",
                gap: theme.spacing.md,
                marginTop: theme.spacing.md,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: theme.text,
                    fontSize: 16,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  Bank: BPI
                </Text>
                <Text style={{ color: theme.text }}>
                  Account Name: Comic Odyssey, Inc.
                </Text>
                <Text style={{ color: theme.text }}>
                  Account Number:{" "}
                  <Pressable
                    className='mt-2'
                    onPress={async () => {
                      await Clipboard.setStringAsync("2601-0259-41")
                      toast.show({
                        placement: "top",
                        render: ({ id }: any) => (
                          <Toast nativeID={"toast-" + id} action='success'>
                            <ToastTitle>Account number copied!</ToastTitle>
                          </Toast>
                        ),
                      })
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        textDecorationLine: "underline",
                        color: theme.text,
                        lineHeight: 18,
                      }}
                    >
                      2601-0259-41
                    </Text>
                  </Pressable>
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: theme.text,
                    fontSize: 16,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  Bank: BDO
                </Text>
                <Text style={{ color: theme.text }}>
                  Account Name: Ma. Rowena Sansolis
                </Text>
                <Text style={{ color: theme.text }}>
                  Account Number:{" "}
                  <Pressable
                    className='mt-2'
                    onPress={async () => {
                      await Clipboard.setStringAsync("0034-1802-0926")
                      toast.show({
                        placement: "top",
                        render: ({ id }: any) => (
                          <Toast nativeID={"toast-" + id} action='success'>
                            <ToastTitle>Account number copied!</ToastTitle>
                          </Toast>
                        ),
                      })
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        textDecorationLine: "underline",
                        color: theme.text,
                        lineHeight: 18,
                      }}
                    >
                      0034-1802-0926
                    </Text>
                  </Pressable>
                </Text>
              </View>
            </View>
          </View>
        )}
        {/* Order Summary */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontWeight: "bold",
              marginBottom: 12,
              fontSize: 16,
              color: theme.text,
              fontFamily: "Inter",
            }}
          >
            Order Summary
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={{
                fontSize: 16,
                color: theme.text,
                fontFamily: "Inter",
              }}
            >
              Subtotal
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.text,
                fontFamily: "Inter",
              }}
            >
              ₱{subTotal.toFixed(2)}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={{
                fontSize: 16,
                color: theme.text,
                fontFamily: "Inter",
              }}
            >
              Shipping Fee
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.text,
                fontFamily: "Inter",
              }}
            >
              ₱{shippingTotal.toFixed(2)}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={{
                fontSize: 16,
                color: theme.text,
                fontFamily: "Inter",
              }}
            >
              Discount
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.text,
                fontFamily: "Inter",
              }}
            >
              ₱{discountTotal.toFixed(2)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginVertical: 12,
            }}
          >
            <Text
              style={{ fontWeight: "bold", fontSize: 16, color: theme.text }}
            >
              Total
            </Text>
            <Text
              style={{ fontWeight: "bold", fontSize: 16, color: theme.text }}
            >
              ₱{totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>
        <Button size='xl' onPress={handleSubmit}>
          <ButtonText>Confirm Order (₱{totalPrice.toFixed(2)})</ButtonText>
        </Button>
      </ScrollView>
    </SafeAreaView>
  )
}
