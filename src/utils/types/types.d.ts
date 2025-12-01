// declarations.d.ts
import { ImageSourcePropType } from "react-native"

declare module "*.png" {
  const value: ImageSourcePropType
  export default value
}

declare module "*.jpg" {
  const value: ImageSourcePropType
  export default value
}

declare module "*.jpeg" {
  const value: ImageSourcePropType
  export default value
}

declare module "*.gif" {
  const value: ImageSourcePropType
  export default value
}

declare module "@/src/assets/icon.png" {
  const value: import("react-native").ImageSourcePropType
  export default value
}
