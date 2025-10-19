import { Card } from "heroui-native";
import { ScrollView, Text, View } from "react-native";

export default function Book() {
  return (
    <ScrollView className="flex-1 bg-lol-black">
      <View className="p-6 gap-6">
        <Card>
          <Card.Header>
            <Card.Title className="text-lol-gold">Cài đặt</Card.Title>
            <Card.Description>Tùy chỉnh ứng dụng của bạn</Card.Description>
          </Card.Header>
          <Card.Body className="gap-4 py-4">
            <Text className="text-lol-gold">Đang phát triển</Text>
          </Card.Body>
        </Card>
      </View>
    </ScrollView>
  );
}
