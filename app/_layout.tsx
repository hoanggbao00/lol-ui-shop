import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import "../global.css";

export default function RootLayout() {
  return (
    <HeroUINativeProvider
      config={{
        theme: {
          light: {
            colors: {
              background: "#00000000",
              border: "#C8AA6E",
            },
          },
        },
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="signin" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </HeroUINativeProvider>
  );
}
