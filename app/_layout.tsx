import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppSettingsProvider } from "@/providers/AppSettingsProvider";
import { HealthDataProvider } from "@/providers/HealthDataProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { trpc, trpcClient } from "@/lib/trpc";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const router = useRouter();
  const { token, absherVerified, isHydrating } = useAuth();

  useEffect(() => {
    if (isHydrating) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (token && !absherVerified) {
      router.replace("/absher");
      return;
    }
    if (token && absherVerified) {
      router.replace("/(tabs)");
    }
  }, [token, absherVerified, isHydrating, router]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back", animation: "fade" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Sign in" }} />
      <Stack.Screen name="absher" options={{ title: "Verify Identity" }} />
      <Stack.Screen name="modal" options={{ presentation: "modal", headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppSettingsProvider>
            <HealthDataProvider>
              <AuthProvider>
                <ErrorBoundary>
                  <RootLayoutNav />
                </ErrorBoundary>
              </AuthProvider>
            </HealthDataProvider>
          </AppSettingsProvider>
        </GestureHandlerRootView>
      </trpc.Provider>
    </QueryClientProvider>
  );
}
