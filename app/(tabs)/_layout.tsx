import { Tabs, Redirect, useRouter } from "expo-router";
import { tabs } from "@/constants/data";
import { View } from "react-native";
import { colors, components } from "@/constants/theme";
import clsx from "clsx";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { scheduleRenewalReminders } from "@/src/services/notificationService";
import { SubscriptionService } from "@/src/services/subscriptionService";
import { createClerkSupabaseClient } from "@/src/config/supabase";

const tabBar = components.tabBar;

const TabIcon = ({ focused, icon }: TabIconProps) => {
  return (
    <View className="tabs-icon">
      <View className={clsx("tabs-pill", focused && "tabs-active")}>
        <Image source={icon} resizeMode="contain" className="tabs-glyph" />
      </View>
    </View>
  );
};
const TabLayout = () => {
  const { isSignedIn, isLoaded, userId, getToken } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Schedule renewal reminders whenever the user is signed in
  useEffect(() => {
    if (!isSignedIn || !userId) return;

    const setup = async () => {
      try {
        const supabase = createClerkSupabaseClient(getToken);
        const service = new SubscriptionService(supabase);
        const rows = await service.getSubscriptions();
        const renewals = rows
          .filter((s) => s.renewal_date)
          .map((s) => ({
            id: s.id,
            name: s.name,
            renewalDate: s.renewal_date!,
            price: s.price,
            currency: s.currency,
          }));
        await scheduleRenewalReminders(renewals);
      } catch (err) {
        console.warn('[TabLayout] Failed to schedule notifications:', err);
      }
    };

    setup();
  }, [isSignedIn, userId]);

  // Navigate to the subscriptions tab when user taps a notification
  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Notification] Received:', notification.request.content.title);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const subscriptionId = response.notification.request.content.data?.subscriptionId;
      if (subscriptionId) {
        router.push('/(tabs)/subscriptions');
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router]);

  // Wait for auth to load before rendering anything
  if (!isLoaded) {
    return null;
  }

  // Redirect to sign-in if user is not authenticated
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle: {
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignItems: "center",
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={tab.icon} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabLayout;
