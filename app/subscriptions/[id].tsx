import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useSubscriptions } from "@/src/hooks/useSubscriptions";
import { formatCurrency, formatSubscriptionDateTime, formatStatusLabel } from "@/lib/utils";
import Feather from "@expo/vector-icons/Feather";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const posthog = usePostHog();
  const { subscriptions, updateSubscription, deleteSubscription, isLoading } = useSubscriptions();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string' && id.trim()) {
      posthog.capture("subscription_details_viewed", {
        subscription_id: id,
      });
    }
  }, [id, posthog]);

  const subscription = useMemo(() => {
    return subscriptions.find(s => s.id === id);
  }, [subscriptions, id]);

  if (isLoading && !subscription) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea7a53" />
      </SafeAreaView>
    );
  }

  if (!subscription) {
    return (
      <SafeAreaView className="flex-1 bg-background p-5 items-center justify-center">
        <Text className="text-lg font-sans-medium text-primary">Subscription not found.</Text>
        <Pressable className="mt-4 px-6 py-3 bg-accent rounded-full" onPress={() => router.back()}>
          <Text className="text-white font-sans-bold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleToggleStatus = async () => {
    const newStatus = subscription.status === 'active' ? 'paused' : 'active';
    setIsProcessing(true);
    try {
      await updateSubscription(subscription.id, { status: newStatus });
      posthog.capture("subscription_status_changed", {
        subscription_id: subscription.id,
        new_status: newStatus,
      });
    } catch (err) {
      Alert.alert("Error", "Failed to update subscription status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Subscription",
      "Are you sure you want to delete this subscription? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsProcessing(true);
            try {
              await deleteSubscription(subscription.id);
              posthog.capture("subscription_deleted", {
                subscription_id: subscription.id,
              });
              router.back();
            } catch (err) {
              Alert.alert("Error", "Failed to delete subscription");
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between border-b border-border">
        <Pressable onPress={() => router.back()} className="size-10 items-center justify-center rounded-full border border-border bg-background">
          <Feather name="chevron-left" className="text-primary" size={24} />
        </Pressable>
        <Text className="text-xl font-sans-bold text-primary">Details</Text>
        <View className="size-10" /> {/* Spacer */}
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Main Info Card */}
        <View className="bg-card rounded-2xl p-6 mb-6 shadow-sm border border-border" style={subscription.color ? { borderTopWidth: 4, borderTopColor: subscription.color } : {}}>
          <View className="items-center mb-6">
            <View className="size-16 rounded-full bg-background items-center justify-center mb-3 shadow-sm border border-border">
               {/* We could use the mapped icon, but since we don't have the mapper here easily without changing types, let's just use Feather fallback or a generic icon */}
               <Feather name="box" size={24} color="#ea7a53" />
            </View>
            <Text className="text-2xl font-sans-bold text-primary">{subscription.name}</Text>
            <Text className="text-sm font-sans-medium text-primary/60">{subscription.category || 'Uncategorized'}</Text>
          </View>

          <View className="items-center mb-6">
            <Text className="text-3xl font-sans-extrabold text-primary">{formatCurrency(subscription.price, subscription.currency)}</Text>
            <Text className="text-sm font-sans-medium text-primary/60">per {subscription.billing.toLowerCase()}</Text>
          </View>
          
          {/* Details List */}
          <View className="space-y-4 border-t border-border pt-4">
            <View className="flex-row justify-between">
              <Text className="text-sm font-sans-medium text-primary/60">Status</Text>
              <Text className={`text-sm font-sans-bold ${subscription.status === 'active' ? 'text-green-500' : 'text-orange-500'}`}>
                {formatStatusLabel(subscription.status)}
              </Text>
            </View>
            <View className="flex-row justify-between mt-3">
              <Text className="text-sm font-sans-medium text-primary/60">Started</Text>
              <Text className="text-sm font-sans-semibold text-primary">{subscription.start_date ? formatSubscriptionDateTime(subscription.start_date) : 'N/A'}</Text>
            </View>
            <View className="flex-row justify-between mt-3">
              <Text className="text-sm font-sans-medium text-primary/60">Next Renewal</Text>
              <Text className="text-sm font-sans-semibold text-primary">{subscription.renewal_date ? formatSubscriptionDateTime(subscription.renewal_date) : 'N/A'}</Text>
            </View>
             <View className="flex-row justify-between mt-3">
              <Text className="text-sm font-sans-medium text-primary/60">Payment Method</Text>
              <Text className="text-sm font-sans-semibold text-primary">{subscription.payment_method || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="space-y-4">
          <Pressable 
            className="w-full bg-accent py-4 rounded-full flex-row justify-center items-center opacity-90"
            disabled={isProcessing}
            onPress={handleToggleStatus}
          >
            {isProcessing ? <ActivityIndicator color="#fff" /> : (
              <>
                <Feather name={subscription.status === 'active' ? 'pause-circle' : 'play-circle'} size={20} color="#fff" className="mr-2" />
                <Text className="text-white font-sans-bold text-base ml-2">{subscription.status === 'active' ? 'Pause Subscription' : 'Resume Subscription'}</Text>
              </>
            )}
          </Pressable>

          <Pressable 
            className="w-full bg-background border border-red-500 py-4 rounded-full flex-row justify-center items-center mt-4"
            disabled={isProcessing}
            onPress={handleDelete}
          >
            <Feather name="trash-2" size={20} color="#ef4444" className="mr-2" />
            <Text className="text-red-500 font-sans-bold text-base ml-2">Delete Subscription</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SubscriptionDetails;
