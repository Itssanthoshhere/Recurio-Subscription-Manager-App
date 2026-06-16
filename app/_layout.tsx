import { SplashScreen, Stack, usePathname, useGlobalSearchParams } from "expo-router";

import "@/global.css";
import { useFonts } from "expo-font";
import { useEffect, useRef } from "react";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { PostHogProvider } from "posthog-react-native";

import { View, Text } from "react-native";
import { posthog } from "@/src/config/posthog";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

function RootLayoutContent() {
  const { isLoaded: authLoaded } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    // Hide splash only when both fonts and auth are loaded
    if (fontsLoaded && authLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoaded]);

  // Identify user in PostHog using the non-PII Clerk user ID
  useEffect(() => {
    if (user?.id) {
      posthog.identify(user.id);
    } else {
      posthog.reset();
    }
  }, [user?.id]);

  // Manual screen tracking for Expo Router
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      // Filter route params to avoid leaking sensitive data
      const sanitizedParams = Object.keys(params).reduce((acc, key) => {
        // Only include specific safe params
        if (['id', 'tab', 'view'].includes(key)) {
          acc[key] = params[key];
        }
        return acc;
      }, {} as Record<string, string | string[]>);
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...sanitizedParams,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  // Don't render app until both are ready
  if (!fontsLoaded || !authLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  if (!publishableKey) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#ef4444", marginBottom: 12 }}>
          Configuration Error
        </Text>
        <Text style={{ fontSize: 14, color: "#666", textAlign: "center", lineHeight: 20 }}>
          Clerk Publishable Key is missing. Please make sure EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is configured in your build environment/secrets.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <PostHogProvider
        client={posthog}
        debug={__DEV__}
        autocapture={{
          captureScreens: false,
          captureTouches: true,
          propsToCapture: ["testID"],
          maxElementsCaptured: 20,
        }}
      >
        <RootLayoutContent />
      </PostHogProvider>
    </ClerkProvider>
  );
}
