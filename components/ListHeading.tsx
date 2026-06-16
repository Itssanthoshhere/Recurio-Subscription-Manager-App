import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

interface ListHeadingProps {
  title: string;
  onPress?: () => void;
  hideViewAll?: boolean;
}

const ListHeading = ({ title, onPress, hideViewAll }: ListHeadingProps) => {
  const router = useRouter();

  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>

      {!hideViewAll && (
        <TouchableOpacity className="list-action" onPress={onPress}>
          <Text className="list-action-text">View all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ListHeading;
