import "@/global.css";

import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from "react-native";
import images from "@/constants/images";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { useState, useMemo, useCallback } from "react";
import { useUser } from "@clerk/expo";
import { usePostHog } from "posthog-react-native";
import { useSubscriptions } from "@/src/hooks/useSubscriptions";
import { mapRowToSubscription, mapRowToUpcoming } from "@/src/utils/mappers";

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const posthog = usePostHog();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const { subscriptions, isLoading, error, addSubscription } = useSubscriptions();

  // Map DB rows to UI types
  const uiSubscriptions: Subscription[] = useMemo(
    () => subscriptions.map(mapRowToSubscription),
    [subscriptions],
  );

  // Compute total monthly spending from live data
  const totalMonthlySpending = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === "active")
      .reduce((sum, sub) => {
        if (sub.billing === "Yearly") return sum + sub.price / 12;
        return sum + sub.price;
      }, 0);
  }, [subscriptions]);

  // Get next upcoming renewal date
  const nextRenewalDate = useMemo(() => {
    const now = dayjs();
    const upcoming = subscriptions
      .filter(
        (sub) =>
          sub.status === "active" &&
          sub.renewal_date &&
          dayjs(sub.renewal_date).isAfter(now),
      )
      .sort((a, b) => dayjs(a.renewal_date).diff(dayjs(b.renewal_date)));
    return upcoming.length > 0 ? upcoming[0].renewal_date : null;
  }, [subscriptions]);

  // Get upcoming subscriptions (active subscriptions with renewal date within next 7 days)
  const upcomingSubscriptions: UpcomingSubscription[] = useMemo(() => {
    const now = dayjs();
    const nextWeek = now.add(7, "days");
    return subscriptions
      .filter(
        (sub) =>
          sub.status === "active" &&
          sub.renewal_date &&
          dayjs(sub.renewal_date).isAfter(now) &&
          dayjs(sub.renewal_date).isBefore(nextWeek),
      )
      .sort((a, b) => dayjs(a.renewal_date).diff(dayjs(b.renewal_date)))
      .map((sub) => {
        const daysLeft = Math.max(1, dayjs(sub.renewal_date).diff(now, "day"));
        return mapRowToUpcoming(sub, daysLeft);
      });
  }, [subscriptions]);

  const handleCreateSubscription = useCallback(
    async (formData: {
      name: string;
      price: number;
      billing: string;
      category: string;
      color: string;
      icon: string;
    }) => {
      const now = dayjs();
      const renewalDate =
        formData.billing === "Yearly"
          ? now.add(1, "year")
          : now.add(1, "month");

      try {
        await addSubscription({
          name: formData.name,
          price: formData.price,
          currency: "INR",
          billing: formData.billing,
          category: formData.category,
          status: "active",
          start_date: now.toISOString(),
          renewal_date: renewalDate.toISOString(),
          color: formData.color,
          icon: formData.icon,
        });

        posthog.capture("subscription_created", {
          subscription_name: formData.name,
          subscription_price: formData.price,
          subscription_frequency: formData.billing,
          subscription_category: formData.category,
        });
      } catch (err) {
        console.error("Failed to create subscription:", err);
      }
    },
    [addSubscription, posthog],
  );

  // Get user display name: firstName, fullName, or email
  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea7a53" />
        <Text className="mt-4 text-sm font-sans-medium text-primary/60">
          Loading subscriptions...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                {/* <Image source={images.avatar} className="home-avatar" />

                <Text className="home-user-name">{HOME_USER.name}</Text> */}

                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>

              {/* <Image source={icons.add} className="home-add-icon" /> */}
              <Pressable onPress={() => setIsModalVisible(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>
            <View className="home-balance-card">
              <Text className="home-balance-label">Monthly Spending</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(totalMonthlySpending)}
                </Text>

                <Text className="home-balance-date">
                  {nextRenewalDate
                    ? dayjs(nextRenewalDate).format("MM/DD")
                    : "—"}
                </Text>
              </View>
            </View>
            <View className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals this week.
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={uiSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const isExpanding = expandedSubscriptionId !== item.id;
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              );
              if (isExpanding) {
                posthog.capture("subscription_expanded", {
                  subscription_id: item.id,
                  subscription_name: item.name,
                  billing_cycle: item.billing,
                  category: item.category ?? null,
                });
              }
            }}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">
            No subscriptions yet. Tap + to add one.
          </Text>
        }
        contentContainerClassName="pb-30"
      />

      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateSubscription}
      />
    </SafeAreaView>
  );
}
