import "@/global.css";
import { Link } from "expo-router";
import { Text } from "react-native";

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-3xl text-primary font-sans-extrabold">
        Welcome to Recurio!
      </Text>

      <Link
        href="/onboarding"
        className="font-sans-bold mt-4 rounded bg-primary text-white p-4"
      >
        Go to Onboarding
      </Link>
      <Link
        href="/(auth)/sign-in"
        className=" font-sans-bold mt-4 rounded bg-primary text-white p-4"
      >
        Go to Sign in
      </Link>
      <Link
        href="/(auth)/sign-up"
        className=" font-sans-bold mt-4 rounded bg-primary text-white p-4"
      >
        Go to Sign up
      </Link>
    </SafeAreaView>
  );
}
