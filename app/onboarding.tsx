import { Image, Pressable, Text, View } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { usePostHog } from "posthog-react-native";
import images from "@/constants/images";

export default function Onboarding() {
  const router = useRouter();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("onboarding_viewed");
  }, [posthog]);

  const handleGetStarted = () => {
    posthog.capture("onboarding_get_started");
    router.push("/(auth)/sign-in");
  };

  return (
    <View className="start-screen">
      <StatusBar style="dark" />

      {/* Geometric pattern illustration */}
      <Image
        source={images.splashPattern}
        className="start-pattern"
        resizeMode="cover"
      />

      {/* Bottom content */}
      <View className="start-bottom">
        <Text className="start-title">Gain Financial Clarity</Text>
        <Text className="start-subtitle">
          Track, analyze and cancel with ease
        </Text>

        <Pressable
          className="start-button"
          onPress={handleGetStarted}
          accessibilityRole="button"
          accessibilityLabel="Get Started"
        >
          <Text className="start-button-text">Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
}
