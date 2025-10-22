import { Stack } from "expo-router";

export default function RootLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="signin" />
			<Stack.Screen name="signup" />
			<Stack.Screen name="(tabs)" />

			<Stack.Screen name="detail-acc" />
		</Stack>
	);
}
