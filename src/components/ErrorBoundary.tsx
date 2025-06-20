import React from "react"
import { View, Text } from "react-native"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    // You can log error to an error reporting service here
    console.error("ErrorBoundary caught an error", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "red", fontSize: 16, margin: 16 }}>
            Something went wrong in this tab.
          </Text>
          <Text selectable style={{ color: "#333", fontSize: 12, margin: 8 }}>
            {this.state.error?.toString()}
          </Text>
        </View>
      )
    }
    return this.props.children
  }
}
