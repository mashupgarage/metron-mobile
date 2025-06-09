import 'ts-node/register'
import { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'comic-odyssey',
  slug: 'comic-odyssey',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './src/assets/splash-icon.png',
    resizeMode: 'contain',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.comicodyssey.metron',
  },
  android: {
    package: 'com.comicodyssey.metron',
    adaptiveIcon: {
      foregroundImage: './src/assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    favicon: './src/assets/favicon.png',
  },
  extra: {
    sessionToken: process.env.SESSION_TOKEN,
    apiUrl: process.env.API_URL,
    eas: {
      projectId: '80691796-1460-45bd-93f5-1df0268da7a7',
    },
  },
  plugins: ['expo-font'],
}

export default config
