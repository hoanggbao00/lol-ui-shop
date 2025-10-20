import { Stack } from "expo-router";
import { StatusBar } from 'react-native';

export default function RootLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<StatusBar barStyle="light-content" />

			<Stack.Screen name="signin" />
			<Stack.Screen name="(tabs)" />
		</Stack>
	);
}
