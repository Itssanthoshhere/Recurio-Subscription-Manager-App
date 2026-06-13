import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

interface ListHeadingProps {
  title: string;
}

const ListHeading = ({ title }: ListHeadingProps) => {
  const router = useRouter();

  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>

      <TouchableOpacity className="list-action" onPress={() => router.push('/(tabs)')}>
        <Text className="list-action-text">View all</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ListHeading;
