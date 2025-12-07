import { colors } from '@/libs/colors';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, error] = useFonts({
		Inter_400Regular,
		Inter_500Medium,
		Inter_600SemiBold,
		Inter_700Bold,
		Inter_800ExtraBold,
  });

	useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
		<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors["lol-black"] } }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="signup" />
			<Stack.Screen name="new" />
			<Stack.Screen name="(tabs)" />

			<Stack.Screen name="detail-acc" />
			<Stack.Screen name="cart" />
			<Stack.Screen name="profile" />

		</Stack>
		</GestureHandlerRootView>
	);
}
