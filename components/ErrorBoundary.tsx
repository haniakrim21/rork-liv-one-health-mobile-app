import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends React.PureComponent<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    console.error("[ErrorBoundary] Caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Error info:", info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container} testID="error-boundary">
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>Please try again. If the issue persists, restart the app.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 18, fontWeight: "600" as const, marginBottom: 8 },
  subtitle: { fontSize: 14, opacity: 0.7, textAlign: "center" },
});