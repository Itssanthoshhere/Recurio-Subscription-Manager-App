import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import Feather from "@expo/vector-icons/Feather";
import BarChart from "@/components/BarChart";
import SubscriptionCard from "@/components/SubscriptionCard";
import { CHART_DATA, INSIGHTS_EXPENSES, INSIGHTS_HISTORY } from "@/constants/data";
import { formatCurrency } from "@/lib/utils";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
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
            <Text className="insights-section-title">Upcoming</Text>
            <Pressable className="insights-view-all">
              <Text className="insights-view-all-text">View all</Text>
            </Pressable>
          </View>
          
          <BarChart data={CHART_DATA} />

          {/* Expenses Card */}
          <View className="expenses-card">
            <View>
              <Text className="expenses-title">Expenses</Text>
              <Text className="expenses-date">{INSIGHTS_EXPENSES.date}</Text>
            </View>
            <View>
              <Text className="expenses-amount">
                -{formatCurrency(INSIGHTS_EXPENSES.amount, INSIGHTS_EXPENSES.currency)}
              </Text>
              <Text className="expenses-growth">{INSIGHTS_EXPENSES.growth}</Text>
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
            {INSIGHTS_HISTORY.map((item) => (
              <SubscriptionCard
                key={item.id}
                name={item.name}
                price={item.price}
                currency={item.currency}
                icon={item.icon}
                billing={item.billing}
                color={item.color}
                category={item.category}
                status={item.status}
                startDate={item.startDate}
                renewalDate={item.renewalDate}
                expanded={false}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;
