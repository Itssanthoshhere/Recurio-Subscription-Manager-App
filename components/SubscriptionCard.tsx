import { View, Text, Image, Pressable, ImageSourcePropType } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@/lib/utils";
import clsx from "clsx";

const SubscriptionCard = ({
  id,
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  plan,
  renewalDate,
  expanded,
  onPress,
  paymentMethod,
  startDate,
  status,
}: SubscriptionCardProps) => {
  const router = useRouter();
  const [iconError, setIconError] = useState(false);

  // Check if icon is a remote URI
  const isRemoteIcon = icon && typeof icon === 'object' && 'uri' in icon;

  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          {iconError || !icon ? (
            <View
              className="sub-icon items-center justify-center"
              style={{ backgroundColor: color || '#6C63FF', borderRadius: 12 }}
            >
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff' }}>
                {name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          ) : (
            <Image
              source={icon}
              className="sub-icon"
              onError={() => setIconError(true)}
            />
          )}
          <View className="sub-copy">
            <Text numberOfLines={1} className="sub-title">
              {name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}
            </Text>
          </View>
        </View>

        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Payment:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {paymentMethod?.trim() || "Not provided"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Category:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {(category?.trim() || plan?.trim()) || "Not provided"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Started:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {startDate
                    ? formatSubscriptionDateTime(startDate)
                    : "Not provided"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Renewal date:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {renewalDate
                    ? formatSubscriptionDateTime(renewalDate)
                    : "Not provided"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Status:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {status ? formatStatusLabel(status) : "Not provided"}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => router.push(`/subscriptions/${id}`)}
              className="mt-4 py-2.5 bg-accent rounded-xl items-center justify-center shadow-sm opacity-90 active:opacity-100"
            >
              <Text className="text-white font-sans-bold text-sm">View Details & Edit</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  );
};
export default SubscriptionCard;
