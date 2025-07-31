import 'ts-node/register'
import { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'comic-odyssey',
  slug: 'comic-odyssey',
  version: '1.0.0',
  owner: 'mashupgarage',
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
    bundleIdentifier: 'com.metron.comic-odyssey',
  },
  android: {
    package: 'com.metron.comicodyssey',
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
      projectId: 'd035a0af-1107-499b-88e8-74976f6a2bdc',
    },
  },
  plugins: ['expo-font'],
}

export default config
