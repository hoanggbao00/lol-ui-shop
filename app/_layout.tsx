import { colors } from '@/libs/colors';
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
		<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors["lol-black"] } }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="signup" />
			
			<Stack.Screen name="(tabs)" />

			<Stack.Screen name="detail-acc" />
			<Stack.Screen name="cart" />
			<Stack.Screen name="profile" />
		</Stack>
		</GestureHandlerRootView>
	);
}
