import { colors } from '@/libs/colors';
import { Stack } from "expo-router";

export default function RootLayout() {
	return (
		<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors["lol-black"] } }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="signup" />
			
			<Stack.Screen name="(tabs)" />

			<Stack.Screen name="detail-acc" />
			<Stack.Screen name="cart" />
		</Stack>
	);
}
