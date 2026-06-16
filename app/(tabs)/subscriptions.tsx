import { Text, View, TextInput, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useState, useMemo } from "react";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/src/hooks/useSubscriptions";
import { mapRowToSubscription } from "@/src/utils/mappers";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { subscriptions, isLoading } = useSubscriptions();

  const allUiSubscriptions = useMemo(
    () => subscriptions.map(mapRowToSubscription),
    [subscriptions],
  );

  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) return allUiSubscriptions;
    const lower = searchQuery.toLowerCase();
    return allUiSubscriptions.filter(
      (sub) =>
        sub.name.toLowerCase().includes(lower) ||
        (sub.category && sub.category.toLowerCase().includes(lower))
    );
  }, [allUiSubscriptions, searchQuery]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea7a53" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View className="px-5 pt-5">
            <Text className="text-3xl font-bold text-dark mb-5">
              Subscriptions
            </Text>
            <TextInput
              className="bg-card rounded-xl px-4 py-3 text-dark mb-4"
              placeholder="Search subscriptions..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        }
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedId === item.id}
            onPress={() =>
              setExpandedId(expandedId === item.id ? null : item.id)
            }
          />
        )}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
