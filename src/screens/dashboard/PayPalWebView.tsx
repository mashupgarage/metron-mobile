import React, { useState } from "react"
import { View, ActivityIndicator, Text, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { WebView } from "react-native-webview"

interface PayPalWebViewProps {
  approvalUrl: string
  onSuccess: (details: any) => void
  onCancel: () => void
}

export default function PayPalWebView({
  approvalUrl,
  onSuccess,
  onCancel,
}: PayPalWebViewProps) {
  const [webViewError, setWebViewError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const handleNavigationStateChange = (navState: any) => {
    if (navState.url.includes("success")) {
      onSuccess(navState)
    } else if (navState.url.includes("cancel")) {
      onCancel()
    }
  }

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent
    setWebViewError(nativeEvent.description || "Failed to load PayPal checkout.")
    console.warn("PayPal WebView error:", nativeEvent)
  }

  const handleRetry = () => {
    setWebViewError(null)
    setReloadKey(prev => prev + 1)
  }

  // Use a common mobile user agent string
  const MOBILE_USER_AGENT =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 40 }}>
        {webViewError ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
            <Text style={{ color: "#B00020", fontSize: 16, marginBottom: 16, textAlign: "center" }}>
              {webViewError}
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: "#0070ba", padding: 12, borderRadius: 6, marginBottom: 10 }}
              onPress={handleRetry}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ borderColor: "#0070ba", borderWidth: 1, padding: 12, borderRadius: 6 }}
              onPress={onCancel}
            >
              <Text style={{ color: "#0070ba", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            key={reloadKey}
            source={{ uri: approvalUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState
            renderLoading={() => (
              <ActivityIndicator size="large" style={{ flex: 1 }} />
            )}
            onError={handleWebViewError}
            userAgent={MOBILE_USER_AGENT}
            thirdPartyCookiesEnabled
            // Allows PayPal sandbox to work better in Expo managed
            javaScriptEnabled
            domStorageEnabled
            // If you ever eject, add PayPal domains to Info.plist NSAppTransportSecurity
          />
        )}
      </View>
    </SafeAreaView>
  )
}
