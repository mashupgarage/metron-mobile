import axiosClient from "./client"

// Create a PayPal order via the Metron backend
export async function createPayPalOrder({
  userId,
  order,
}: {
  userId: number
  order: any // shape should match backend expectations
}) {
  // POST to /api/v1/checkout, expects { order: {..., transaction_source: 'paypal'} }
  const response = await axiosClient.post(`users/${userId}/checkout`, {
    order: {
      ...order,
      transaction_source: "paypal",
    },
  })
  // The backend should return { next_url: "https://www.sandbox.paypal.com/checkoutnow?..." }
  return {
    approvalUrl: response.data.next_url,
    orderId: response.data.order_id || null, // if available
  }
}

// Optionally, implement capturePayPalOrder if backend exposes such endpoint
export async function capturePayPalOrder({ orderId }: { orderId: string }) {
  // If backend has a capture endpoint, call it here. Placeholder:
  const response = await axiosClient.post(`payments/paypal/capture`, {
    order_id: orderId,
  })
  return response.data
}
