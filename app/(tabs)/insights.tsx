import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import Feather from "@expo/vector-icons/Feather";
import BarChart from "@/components/BarChart";
import SubscriptionCard from "@/components/SubscriptionCard";
import { formatCurrency } from "@/lib/utils";
import { useSubscriptions } from "@/src/hooks/useSubscriptions";
import { mapRowToSubscription } from "@/src/utils/mappers";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useRouter } from "expo-router";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const router = useRouter();
  const { subscriptions, isLoading } = useSubscriptions();

  // Calculate dynamic 7-day chart data
  const chartData = useMemo(() => {
    const today = dayjs().startOf('day');
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const targetDate = today.add(i, 'day');
      
      // Sum the price of active subscriptions renewing on this specific day
      const dailyCost = subscriptions
        .filter(sub => 
          sub.status === 'active' && 
          sub.renewal_date && 
          dayjs(sub.renewal_date).isSame(targetDate, 'day')
        )
        .reduce((sum, sub) => sum + sub.price, 0);

      days.push({
        day: targetDate.format('ddd'),
        value: dailyCost,
        active: i === 0, // Highlight today
      });
    }
    return days;
  }, [subscriptions]);

  // Calculate total monthly expenses
  const totalExpenses = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === "active")
      .reduce((sum, sub) => {
        if (sub.billing === "Yearly") return sum + sub.price / 12;
        return sum + sub.price;
      }, 0);
  }, [subscriptions]);

  // Generate history (sorted by newest created first)
  const historyList = useMemo(() => {
    return [...subscriptions]
      .sort((a, b) => dayjs(b.created_at).diff(dayjs(a.created_at)))
      .map(mapRowToSubscription);
  }, [subscriptions]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea7a53" />
      </SafeAreaView>
    );
  }

  if (subscriptions.length === 0) {
    // If there's an error in fetching, the length will be 0. We can just show a friendly message or the actual error if we exposed it.
    // For now, let's gracefully handle empty state.
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="insights-header">
        <Pressable className="size-10 items-center justify-center rounded-full border border-border bg-background">
          <Feather name="chevron-left" className="text-primary" size={24} color="#081126" />
        </Pressable>
        <Text className="insights-title">Monthly Insights</Text>
        <Pressable className="size-10 items-center justify-center rounded-full border border-border bg-background">
          <Feather name="more-horizontal" className="text-primary" size={20} color="#081126" />
        </Pressable>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerClassName="pb-30"
        showsVerticalScrollIndicator={false}
      >
        {/* Upcoming Section */}
        <View className="insights-section">
          <View className="insights-section-header">
            <Text className="insights-section-title">Upcoming 7 Days</Text>
            <Pressable className="insights-view-all">
              <Text className="insights-view-all-text">View all</Text>
            </Pressable>
          </View>
          
          <BarChart data={chartData} />

          {/* Expenses Card */}
          <View className="expenses-card">
            <View>
              <Text className="expenses-title">Active Expenses</Text>
              <Text className="expenses-date">{dayjs().format('MMMM YYYY')}</Text>
            </View>
            <View>
              <Text className="expenses-amount">
                -{formatCurrency(totalExpenses, "INR")}
              </Text>
              <Text className="expenses-growth">Current Rate</Text>
            </View>
          </View>
        </View>

        {/* History Section */}
        <View className="insights-section">
          <View className="insights-section-header">
            <Text className="insights-section-title">History</Text>
            <Pressable className="insights-view-all">
              <Text className="insights-view-all-text">View all</Text>
            </Pressable>
          </View>

          <View className="gap-4">
            {historyList.length === 0 ? (
              <Text className="text-center text-primary/60 font-sans-medium mt-4">No subscriptions yet.</Text>
            ) : (
              historyList.map((item) => (
                <SubscriptionCard
                  key={item.id}
                  {...item}
                  expanded={false}
                  onPress={() => router.push(`/subscriptions/${item.id}`)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;
