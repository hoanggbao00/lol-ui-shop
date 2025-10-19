import { Button, Card, Chip, useTheme } from "heroui-native";
import { ScrollView, View } from "react-native";

export default function Index() {
  const { isDark } = useTheme();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-6">
        {/* Card component */}
        <Card>
          <Card.Header>
            <Card.Title>Welcome to League of Legends Shop</Card.Title>
            <Card.Description>
              Browse and purchase your favorite champions and skins
            </Card.Description>
          </Card.Header>
          <Card.Body className="gap-4">
            <View className="flex-row gap-2">
              <Chip variant="primary" color="accent">New</Chip>
              <Chip variant="secondary" color="success">Featured</Chip>
              <Chip variant="tertiary" color="warning">Sale</Chip>
            </View>
          </Card.Body>
          <Card.Footer className="gap-3 mt-4">
            <Button variant="primary" onPress={() => console.log('Browse pressed')}>
              Browse Shop
            </Button>
            <Button variant="ghost" onPress={() => console.log('View account pressed')}>
              My Account
            </Button>
          </Card.Footer>
        </Card>

        <Card surfaceVariant="2" className="rounded-xl">
          <View className="gap-4">
            <Card.Header>
              <View className="bg-accent rounded-full w-12 h-12 items-center justify-center">
                <Card.Title className="text-accent-foreground">RP</Card.Title>
              </View>
            </Card.Header>
            <Card.Body>
              <Card.Title>Riot Points</Card.Title>
              <Card.Description className="mb-4">
                Purchase Riot Points to buy champions, skins, and more.
              </Card.Description>
            </Card.Body>
            <Card.Footer>
              <Button variant="primary" onPress={() => console.log('Buy RP pressed')}>
                Buy RP
              </Button>
            </Card.Footer>
          </View>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Daily Deals</Card.Title>
            <Card.Description>
              Special offers refreshed daily
            </Card.Description>
          </Card.Header>
          <Card.Body className="gap-4 mt-2">
            <View className="flex-row flex-wrap gap-2">
              <Chip size="sm" variant="secondary" color="danger">
                <Chip.Label>50% OFF</Chip.Label>
              </Chip>
              <Chip size="sm" variant="secondary" color="accent">
                <Chip.Label>Limited Time</Chip.Label>
              </Chip>
              <Chip size="sm" variant="secondary" color="success">
                <Chip.Label>Exclusive</Chip.Label>
              </Chip>
            </View>
          </Card.Body>
          <Card.Footer className="mt-4">
            <Button variant="secondary" onPress={() => console.log('View deals pressed')}>
              View Deals
            </Button>
          </Card.Footer>
        </Card>
      </View>
    </ScrollView>
  );
}
