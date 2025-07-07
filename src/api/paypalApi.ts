import axiosClient from "./client"

// Create a PayPal order via the Metron backend
export async function createPayPalOrder({
  userId,
  order,
}: {
  userId: number
  order: {
    notes: string
    branch: number
    phone_number: string
    shipping_address: string
    shipping_region: string
    total_price: number
    delivery_option: "store" | "shipping"
    transaction_source: "paypal"
    status: "pending"
  } // shape should match backend expectations
}) {
  // POST to /api/v1/checkout, expects { order: {..., transaction_source: 'paypal'} }
  const response = await axiosClient.post(`users/${userId}/checkout`, {
    order: {
      ...order,
      transaction_source: "paypal",
    },
  })
  return {
    approvalUrl: response.data.next_url,
    orderId: response.data.order_id || null, // if available
  }
}
