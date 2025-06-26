import React, { useState, useMemo, useEffect } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { View, Text, ScrollView, Pressable, TextInput } from "react-native"
import * as Clipboard from "expo-clipboard"
import { useNavigation } from "@react-navigation/native"
import { useBoundStore } from "@/src/store"
import { Button, ButtonText } from "@/src/components/ui/button"
import { Input, InputField } from "@/src/components/ui/input"
import { Toast, ToastTitle, useToast } from "@/src/components/ui/toast"
import { checkoutCartItems } from "@/src/api/apiEndpoints"
import { createPayPalOrder, capturePayPalOrder } from "@/src/api/paypalApi"
import PayPalWebView from "./PayPalWebView"
import { Modal } from "react-native"

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
import { fonts } from "@/src/theme"
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

const CheckoutScreen = ({ route }: any) => {
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
  useEffect(() => {
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

  // PayPal modal and state hooks (for PayPal integration)
  const [paypalLoading, setPaypalLoading] = useState(false)
  const [paypalApprovalUrl, setPaypalApprovalUrl] = useState<string | null>(
    null
  )
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null)
  const [showPayPalModal, setShowPayPalModal] = useState(false)

  const handleSubmit = async () => {
    if (transactionSource === "paypal") {
      console.log("paypal")
      setPaypalLoading(true)
      try {
        // Pass userId and full order object to backend
        const { approvalUrl, orderId } = await createPayPalOrder({
          userId: user.id,
          order: form,
        })
        setPaypalApprovalUrl(approvalUrl)
        setPaypalOrderId(orderId)
        setShowPayPalModal(true)
      } catch (err) {
        console.log(err)
        toast.show({
          placement: "top",
          render: ({ id }: any) => (
            <Toast nativeID={"toast-" + id} action='error'>
              <ToastTitle>PayPal initialization failed.</ToastTitle>
            </Toast>
          ),
        })
      } finally {
        setPaypalLoading(false)
      }
      return
    }

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
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
        <Text
          style={[
            fonts.title,
            { color: theme.text, paddingVertical: theme.spacing.md },
          ]}
        >
          Order Confirmation
        </Text>
        {/* Delivery Option */}
        <View style={{ marginBottom: theme.spacing.md }}>
          <FormControl isInvalid={!!formErrors.delivery_option} size='md'>
            <FormControlLabel>
              <FormControlLabelText
                style={[
                  fonts.label,
                  {
                    color: theme.text,
                    fontSize: 14,
                    fontWeight: 500,
                    marginBottom: theme.spacing.xs,
                  },
                ]}
              >
                Delivery Option
              </FormControlLabelText>
            </FormControlLabel>

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
          </FormControl>
        </View>
        {/* Shipping / Branch Fields */}
        {deliveryOption === "shipping" ? (
          <View>
            <View style={{ marginBottom: theme.spacing.sm }}>
              <FormControl isInvalid={!!formErrors.shipping_address} size='md'>
                <FormControlLabel>
                  <FormControlLabelText
                    style={[fonts.label, { color: theme.text }]}
                  >
                    Shipping Address
                  </FormControlLabelText>
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
                    <FormControlErrorText style={[fonts.body]}>
                      {formErrors.shipping_address}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>
            </View>
            <View style={{ marginBottom: 8 }}>
              <FormControl isInvalid={!!formErrors.shipping_region} size='md'>
                <FormControlLabel>
                  <FormControlLabelText
                    style={[fonts.label, { color: theme.text, fontSize: 14 }]}
                  >
                    Region
                  </FormControlLabelText>
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
                    <FormControlErrorText style={[fonts.body]}>
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
                <FormControlLabelText
                  style={[fonts.label, { color: theme.text, fontSize: 14 }]}
                >
                  Branch
                </FormControlLabelText>
              </FormControlLabel>
              <TextInput
                style={[
                  fonts.body,
                  {
                    color: theme.text,
                    width: "100%",
                    height: 38.5,
                    borderWidth: 1,
                    lineHeight: 20,
                    borderColor: theme.border,
                    borderRadius: 4,
                    marginBottom: theme.spacing.xs,
                    paddingLeft: theme.spacing.sm,
                  },
                ]}
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
              {!!formErrors.branch && (
                <FormControlError>
                  <FormControlErrorText style={[fonts.body]}>
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
              <FormControlLabelText
                style={[fonts.label, { color: theme.text, fontSize: 14 }]}
              >
                Phone Number
              </FormControlLabelText>
            </FormControlLabel>
            <TextInput
              value={form.phone_number}
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
              style={[
                fonts.body,
                {
                  color: theme.text,
                  width: "100%",
                  borderColor: theme.border,
                  borderWidth: 1,
                  lineHeight: 20,
                  borderRadius: 4,
                  paddingVertical: 4,
                  marginBottom: theme.spacing.xs,
                  height: 38.5,
                  paddingLeft: theme.spacing.sm,
                },
              ]}
              autoCapitalize='none'
            />
            {!!formErrors.phone_number && (
              <FormControlError>
                <FormControlErrorText style={[fonts.body]}>
                  {formErrors.phone_number}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>
        </View>
        <View style={{ marginBottom: 16 }}>
          <FormControl isInvalid={!!formErrors.notes} size='md'>
            <FormControlLabel>
              <FormControlLabelText
                style={[fonts.label, { color: theme.text, fontSize: 14 }]}
              >
                Notes
              </FormControlLabelText>
            </FormControlLabel>
            <TextInput
              value={form.notes}
              multiline
              style={[
                fonts.body,
                {
                  color: theme.text,
                  width: "100%",
                  borderColor: theme.border,
                  borderWidth: 1,
                  borderRadius: 4,
                  paddingVertical: 4,
                  marginBottom: theme.spacing.xs,
                  height: 100,
                  paddingLeft: theme.spacing.sm,
                },
              ]}
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
            {!!formErrors.notes && (
              <FormControlError>
                <FormControlErrorText style={[fonts.body]}>
                  {formErrors.notes}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>
        </View>
        {/* Payment Method */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={[
              fonts.label,
              {
                color: theme.text,
                fontSize: 14,
                fontWeight: 600,
                marginBottom: theme.spacing.lg,
              },
            ]}
          >
            Payment Method
          </Text>
          <RadioGroup
            value={transactionSource}
            onChange={(val: string) =>
              setTransactionSource(
                val as "paypal" | "bank_deposit" | "cod" | "pay_at_store"
              )
            }
          >
            <Radio
              value='paypal'
              size='lg'
              style={{ marginBottom: theme.spacing.md }}
            >
              <RadioIndicator>
                <RadioIcon
                  color={theme.primary[300]}
                  as={CircleIcon}
                  fill={theme.primary[500]}
                />
              </RadioIndicator>
              <RadioLabel style={[fonts.body, { color: theme.text }]}>
                PayPal
              </RadioLabel>
            </Radio>
            <Radio
              value='bank_deposit'
              size='lg'
              style={{ marginBottom: theme.spacing.md }}
            >
              <RadioIndicator>
                <RadioIcon
                  color={theme.primary[300]}
                  as={CircleIcon}
                  fill={theme.primary[500]}
                />
              </RadioIndicator>
              <RadioLabel style={[fonts.body, { color: theme.text }]}>
                Bank Deposit
              </RadioLabel>
            </Radio>
            <Radio
              value='pay_at_store'
              size='lg'
              style={{ marginBottom: theme.spacing.md }}
            >
              <RadioIndicator>
                <RadioIcon
                  color={theme.primary[300]}
                  as={CircleIcon}
                  fill={theme.primary[500]}
                />
              </RadioIndicator>
              <RadioLabel style={[fonts.body, { color: theme.text }]}>
                Pay at Store
              </RadioLabel>
            </Radio>
          </RadioGroup>
        </View>
        {transactionSource === "bank_deposit" && (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={[
                fonts.body,
                { color: theme.text, marginBottom: theme.spacing.md },
              ]}
            >
              Instructions to pay via bank
            </Text>
            <Text style={[fonts.body, { color: theme.text }]}>
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
                  style={[
                    fonts.label,
                    {
                      color: theme.text,
                      marginBottom: theme.spacing.md,
                    },
                  ]}
                >
                  Bank: BPI
                </Text>
                <Text
                  style={[
                    fonts.body,
                    { color: theme.text, marginTop: theme.spacing.sm },
                  ]}
                >
                  Account Name: Comic Odyssey, Inc.
                </Text>
                <Text
                  style={[
                    fonts.body,
                    { color: theme.text, marginVertical: theme.spacing.sm },
                  ]}
                >
                  Account Number:{" "}
                  <Pressable
                    className='mt-1'
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
                      style={[
                        {
                          color: theme.text,
                          textDecorationLine: "underline",
                        },
                      ]}
                    >
                      2601-0259-41
                    </Text>
                  </Pressable>
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    fonts.label,
                    {
                      color: theme.text,
                      marginVertical: theme.spacing.sm,
                    },
                  ]}
                >
                  Bank: BDO
                </Text>
                <Text
                  style={[
                    fonts.body,
                    {
                      color: theme.text,
                      marginTop: theme.spacing.sm,
                    },
                  ]}
                >
                  Account Name: Ma. Rowena Sansolis
                </Text>
                <Text
                  style={[
                    fonts.body,
                    {
                      color: theme.text,
                      marginVertical: theme.spacing.sm,
                    },
                  ]}
                >
                  Account Number:{" "}
                  <Pressable
                    className='mt-1'
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
                      style={[
                        {
                          color: theme.text,
                          textDecorationLine: "underline",
                        },
                      ]}
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
            style={[
              fonts.label,
              { color: theme.text, marginBottom: theme.spacing.md },
            ]}
          >
            Order Summary
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={[
                fonts.caption,
                { color: theme.text, marginBottom: theme.spacing.sm },
              ]}
            >
              Subtotal
            </Text>
            <Text
              style={[
                fonts.body,
                { color: theme.text, marginBottom: theme.spacing.sm },
              ]}
            >
              ₱{subTotal.toFixed(2)}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={[
                fonts.caption,
                { color: theme.text, marginBottom: theme.spacing.sm },
              ]}
            >
              Shipping Fee
            </Text>
            <Text
              style={[
                fonts.body,
                { color: theme.text, marginBottom: theme.spacing.sm },
              ]}
            >
              ₱{shippingTotal.toFixed(2)}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={[
                fonts.caption,
                { color: theme.text, marginBottom: theme.spacing.sm },
              ]}
            >
              Discount
            </Text>
            <Text
              style={[
                fonts.body,
                { color: theme.text, marginBottom: theme.spacing.sm },
              ]}
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
            <Text style={[fonts.label, { color: theme.text }]}>Total</Text>
            <Text style={[fonts.label, { color: theme.text }]}>
              ₱{totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>
        <Button
          size='xl'
          variant='solid'
          action='primary'
          style={{ backgroundColor: theme.primary[500] }}
          onPress={handleSubmit}
        >
          <ButtonText style={[fonts.label, { color: theme.white }]}>
            Confirm Order (₱{totalPrice.toFixed(2)})
          </ButtonText>
        </Button>
      </ScrollView>
      {/* PayPal Modal Integration */}
      <Modal
        visible={showPayPalModal}
        animationType='slide'
        onRequestClose={() => setShowPayPalModal(false)}
        transparent={false}
      >
        <View style={{ flex: 1, paddingTop: 40 }}>
          {/* Cancel Button */}
          <View
            style={{
              padding: 16,
              alignItems: "flex-end",
              zIndex: 2,
            }}
          >
            <Button
              variant='outline'
              size='md'
              onPress={() => {
                setShowPayPalModal(false)
                toast.show({
                  placement: "top",
                  render: ({ id }: any) => (
                    <Toast nativeID={"toast-" + id} action='warning'>
                      <ToastTitle>PayPal payment cancelled.</ToastTitle>
                    </Toast>
                  ),
                })
              }}
              style={{ minWidth: 80 }}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
          </View>
          {/* PayPal WebView */}
          <View style={{ flex: 1 }}>
            {paypalApprovalUrl
              ? // Log approval URL for debugging
                ((() => {
                  console.log("PayPal Approval URL:", paypalApprovalUrl)
                  return null
                })(),
                (
                  <PayPalWebView
                    approvalUrl={paypalApprovalUrl}
                    onSuccess={async (details) => {
                      setShowPayPalModal(false)
                      try {
                        await capturePayPalOrder({ orderId: paypalOrderId! })
                        // Place order in backend
                        await checkoutCartItems(user.id, {
                          order: {
                            ...form,
                            transaction_source: "paypal",
                          } as any,
                        })
                        toast.show({
                          placement: "top",
                          render: ({ id }: any) => (
                            <Toast nativeID={"toast-" + id} action='success'>
                              <ToastTitle>
                                PayPal payment successful! Order placed.
                              </ToastTitle>
                            </Toast>
                          ),
                        })
                        store.setCartItems([])
                        navigation.navigate("Home" as never)
                      } catch (err) {
                        toast.show({
                          placement: "top",
                          render: ({ id }: any) => (
                            <Toast nativeID={"toast-" + id} action='error'>
                              <ToastTitle>
                                PayPal payment failed. Please try again.
                              </ToastTitle>
                            </Toast>
                          ),
                        })
                      }
                    }}
                    onCancel={() => {
                      setShowPayPalModal(false)
                      toast.show({
                        placement: "top",
                        render: ({ id }: any) => (
                          <Toast nativeID={"toast-" + id} action='warning'>
                            <ToastTitle>PayPal payment cancelled.</ToastTitle>
                          </Toast>
                        ),
                      })
                    }}
                  />
                ))
              : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default CheckoutScreen
