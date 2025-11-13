import TabBarBackground from "@/components/bottom-tabs/TabBarBackground";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { Image } from "expo-image";
import { Tabs, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";

const icons = {
	Home: require("@/assets/icons/shopping-cart.png"),
	Book: require("@/assets/icons/borrow-book.png"),
	Document: require("@/assets/icons/document.png"),
	User: require("@/assets/icons/user.png"),
};

type TabBarIconProps = {
	color?: string;
	focused: boolean;
};

// Custom SVG Icon Components for React Native
const HomeIcon = ({ focused }: TabBarIconProps) => (
	<View style={focused && styles.activeIconContainer}>
		{focused && <View style={styles.activeCircle} />}
		{focused && <View style={styles.activeCircle2} />}
		<Image source={icons.Home} style={{ width: 24, height: 24 }} />
	</View>
);

const BookIcon = ({ focused }: TabBarIconProps) => (
	<View style={focused && styles.activeIconContainer}>
		{focused && <View style={styles.activeCircle} />}
		{focused && <View style={styles.activeCircle2} />}
		<Image source={icons.Book} style={{ width: 24, height: 24 }} />
	</View>
);

const DocumentIcon = ({ focused }: TabBarIconProps) => (
	<View style={focused && styles.activeIconContainer}>
		{focused && <View style={styles.activeCircle} />}
		{focused && <View style={styles.activeCircle2} />}
		<Image source={icons.Document} style={{ width: 24, height: 24 }} />
	</View>
);

const UserIcon = ({ focused }: TabBarIconProps) => (
	<View style={focused && styles.activeIconContainer}>
		{focused && <View style={styles.activeCircle} />}
		{focused && <View style={styles.activeCircle2} />}
		<Image source={icons.User} style={{ width: 24, height: 24 }} />
	</View>
);

// Tabs Layout Component
export default function TabLayout() {
	const [user, setUser] = useState();
	const [initializing, setInitializing] = useState(true);

	function handleAuthStateChanged(_user: any) {
		setUser(_user);
		if (initializing) setInitializing(false);
	}

	useEffect(() => {
		const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
		return subscriber;
	}, []);

	useEffect(() => {
		if (!user) {
			router.replace("/");
		}
	}, [user]);
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#E4B831",
				tabBarInactiveTintColor: "#8B7355",
				tabBarStyle: styles.tabBar,
				tabBarShowLabel: false,
				headerShown: false,
				tabBarBackground: () => <TabBarBackground />,
			}}
		>
			<StatusBar barStyle="light-content" />

			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
				}}
			/>
			<Tabs.Screen
				name="book"
				options={{
					title: "Book",
					tabBarIcon: ({ focused }) => <BookIcon focused={focused} />,
				}}
			/>
			<Tabs.Screen
				name="dang-ban"
				options={{
					title: "Đăng bán",
					tabBarIcon: ({ focused }) => <DocumentIcon focused={focused} />,
				}}
			/>
			<Tabs.Screen
				name="user"
				options={{
					title: "User",
					tabBarIcon: ({ focused }) => <UserIcon focused={focused} />,
				}}
			/>
		</Tabs>
	);
}

const styles = StyleSheet.create({
	tabBar: {
		height: 80,
		paddingTop: 23,
		shadowColor: "transparent",
		position: "absolute",
		borderTopColor: "transparent",
		backgroundColor: "black",
	},
	activeIconContainer: {
		position: "relative",
		alignItems: "center",
		justifyContent: "center",
	},
	activeCircle: {
		position: "absolute",
		width: 40,
		height: 40,
		borderRadius: 30,
		borderWidth: 1,
		borderColor: "#FBE5A2",
		zIndex: -1,
	},
	activeCircle2: {
		position: "absolute",
		width: 45,
		height: 45,
		borderRadius: 30,
		borderWidth: 1,
		borderColor: "#FBE5A2",
		zIndex: -1,
	},
	tabBarBackground: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		height: 100,
	},
	backgroundSvg: {
		position: "absolute",
		bottom: -20,
	},
});
