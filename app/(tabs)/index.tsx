import "@/global.css";

import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
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
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const router = useRouter();
  const { user } = useUser();
  const posthog = usePostHog();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const { subscriptions, isLoading, error, addSubscription } = useSubscriptions();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "price_desc" | "price_asc" | "renewal_asc">("newest");

  // Map DB rows to UI types
  const allUiSubscriptions: Subscription[] = useMemo(
    () => subscriptions.map(mapRowToSubscription),
    [subscriptions],
  );

  // Apply Search, Filter, and Sort
  const filteredSubscriptions = useMemo(() => {
    let result = [...allUiSubscriptions];

    // Search
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(sub => 
        sub.name.toLowerCase().includes(lowerQuery) || 
        (sub.category && sub.category.toLowerCase().includes(lowerQuery))
      );
    }

    // Filter
    if (selectedCategory !== "All") {
      result = result.filter(sub => sub.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOrder) {
        case "price_desc":
          return b.price - a.price;
        case "price_asc":
          return a.price - b.price;
        case "renewal_asc":
          if (!a.renewalDate) return 1;
          if (!b.renewalDate) return -1;
          return dayjs(a.renewalDate).diff(dayjs(b.renewalDate));
        case "newest":
        default:
          return 0; // The original DB fetch order is usually created_at desc if we set it up, but here we'll just keep stable or rely on history map
      }
    });

    return result;
  }, [allUiSubscriptions, searchQuery, selectedCategory, sortOrder]);

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
      startDate: string;
      renewalDate: string;
      paymentMethod?: string;
    }) => {
      try {
        await addSubscription({
          name: formData.name,
          price: formData.price,
          currency: "INR",
          billing: formData.billing,
          category: formData.category,
          status: "active",
          start_date: formData.startDate,
          renewal_date: formData.renewalDate,
          color: formData.color,
          icon: formData.icon,
          payment_method: formData.paymentMethod || null,
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

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center p-5">
        <Feather name="alert-circle" size={40} color="#ef4444" />
        <Text className="mt-4 text-base font-sans-bold text-red-500 text-center">
          Failed to load subscriptions
        </Text>
        <Text className="mt-2 text-sm font-sans-medium text-primary/60 text-center">
          {error}
        </Text>
      </SafeAreaView>
    );
  }

  const categories = ["All", ...Array.from(new Set(allUiSubscriptions.map(s => s.category).filter(Boolean)))];

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>

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
              <ListHeading title="Upcoming" hideViewAll />

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

            <ListHeading title="All Subscriptions" onPress={() => router.push('/(tabs)/subscriptions')} />
            
            {/* Search and Filters */}
            <View style={{ marginTop: 16, marginBottom: 16, gap: 12 }}>
              <View className="flex-row items-center bg-card rounded-full px-4 py-3 border border-border shadow-sm">
                <Feather name="search" size={20} color="#081126" className="opacity-50" />
                <TextInput 
                  className="flex-1 ml-3 font-sans-medium text-primary"
                  placeholder="Search subscriptions..."
                  placeholderTextColor="rgba(8, 17, 38, 0.4)"
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    if (text.length > 2) posthog.capture('search_performed', { query: text });
                  }}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <Feather name="x-circle" size={18} color="#081126" className="opacity-50" />
                  </Pressable>
                )}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row" contentContainerStyle={{ gap: 8 }}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      setSelectedCategory(cat as string);
                      posthog.capture('filter_applied', { category: cat ?? null });
                    }}
                    className={`px-4 py-2 rounded-full border ${selectedCategory === cat ? 'bg-accent border-accent' : 'bg-card border-border'}`}
                  >
                    <Text className={`font-sans-bold text-sm ${selectedCategory === cat ? 'text-white' : 'text-primary'}`}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              
              <View className="flex-row justify-between items-center mt-2 px-1">
                <Text className="text-xs font-sans-medium text-primary/60">Sort by:</Text>
                <View className="flex-row gap-3">
                   <Pressable onPress={() => setSortOrder("newest")}>
                     <Text className={`text-xs font-sans-bold ${sortOrder === "newest" ? "text-accent" : "text-primary/60"}`}>Newest</Text>
                   </Pressable>
                   <Pressable onPress={() => setSortOrder("price_desc")}>
                     <Text className={`text-xs font-sans-bold ${sortOrder === "price_desc" ? "text-accent" : "text-primary/60"}`}>Highest Cost</Text>
                   </Pressable>
                   <Pressable onPress={() => setSortOrder("renewal_asc")}>
                     <Text className={`text-xs font-sans-bold ${sortOrder === "renewal_asc" ? "text-accent" : "text-primary/60"}`}>Renewal</Text>
                   </Pressable>
                </View>
              </View>
            </View>
          </>
        )}
        data={filteredSubscriptions}
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
