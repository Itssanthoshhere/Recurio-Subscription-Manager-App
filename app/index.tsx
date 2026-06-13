import { Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  // If signed in, go straight to the main tabs app
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  // If not signed in, show the onboarding screen
  return <Redirect href="/onboarding" />;
}
