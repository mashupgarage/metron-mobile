export interface AuthStackParams {
  SignIn: undefined;
  SignUp: undefined;
  Onboarding: undefined;
  NotFound: undefined;
}

import { ParamListBase } from '@react-navigation/native';

export interface DashboardStackParams extends ParamListBase {
  Onboarding: undefined;
  Home: { category_id?: number };
  NotFound: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Product: { product: Product };
  Wantlist: undefined;
  CGCSubmit: undefined;
}
