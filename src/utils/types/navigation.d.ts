export interface AuthStackParams {
  SignIn: undefined
  SignUp: undefined
  Onboarding: undefined
  NotFound: undefined
}

export interface DashboardStackParams {
  Onboarding: undefined
  Home: { category_id?: number }
  NotFound: undefined
  SignIn: undefined
  SignUp: undefined
  Product: { product: Product }
  Wantlist: undefined
  CGCSubmit: undefined
  DetailedCollectionScreen: { seriesId: number }
  CheckoutScreen: { itemsToCheckout: any[] }
  OrderDetails: { order: any }
  OrdersScreen: undefined
}
