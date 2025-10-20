import Background from '@/components/Background';
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {

  return (
    <View
    style={{
      flex: 1,
      position: "relative",
    }}
    >
      <Background />
      <View style={{
        padding: 24,
        gap: 24,
        position: "relative",
      }}>
        
        {/* Card component */}
        <View>
          <View>
            <Text>Welcome to League of Legends Shop</Text>
            <Text>
              Browse and purchase your favorite champions and skins
            </Text>
          </View>
          <View className="gap-4">
            <View className="flex-row gap-2">
              <Text>New</Text>
              <Text>Featured</Text>
              <Text>Sale</Text>
            </View>
          </View>
          <View className="gap-3 mt-4">
            <TouchableOpacity onPress={() => console.log('Browse pressed')}>
              <Text>Browse Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('View account pressed')}>
              <Text>My Account</Text>
            </TouchableOpacity>
          </View>
        </View>

          <View className="rounded-xl">
          <View className="gap-4">
            <View>
              <View className="bg-accent rounded-full w-12 h-12 items-center justify-center">
                <Text className="text-accent-foreground">RP</Text>
              </View>
            </View>
            <View>
              <Text>Riot Points</Text>
              <Text className="mb-4">
                Purchase Riot Points to buy champions, skins, and more.
              </Text>
            </View>
            <View>
              <TouchableOpacity onPress={() => console.log('Buy RP pressed')}>
                <Text>Buy RP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View>
          <View>
            <Text>Daily Deals</Text>
            <Text>
              Special offers refreshed daily
            </Text>
          </View>
          <View className="gap-4 mt-2">
            <View className="flex-row flex-wrap gap-2">
              <Text>50% OFF</Text>
              <Text>Limited Time</Text>
              <Text>Exclusive</Text>
            </View>
          </View>
          <View className="mt-4">
            <TouchableOpacity onPress={() => console.log('View deals pressed')}>
              <Text>View Deals</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
