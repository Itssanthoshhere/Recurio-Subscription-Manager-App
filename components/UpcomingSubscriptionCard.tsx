import { View, Text, Image } from "react-native";
import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";

const UpcomingSubscriptionCard = ({
  name,
  price,
  daysLeft,
  icon,
  currency,
}: UpcomingSubscription) => {
  const [iconError, setIconError] = useState(false);

  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        {iconError || !icon ? (
          <View
            className="upcoming-icon items-center justify-center"
            style={{ backgroundColor: '#6C63FF', borderRadius: 10 }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>
              {name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        ) : (
          <Image
            source={icon}
            className="upcoming-icon"
            onError={() => setIconError(true)}
          />
        )}
        <View>
          <Text className="upcoming-price">
            {formatCurrency(price, currency)}
          </Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {daysLeft > 1 ? `${daysLeft} days left` : "Last day"}
          </Text>
        </View>
      </View>

      <Text className="upcoming-name" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
};
export default UpcomingSubscriptionCard;
