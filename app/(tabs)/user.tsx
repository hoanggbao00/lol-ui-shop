import Background from "@/components/Background";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileMenuCard from "@/components/profile/ProfileMenuCard";
import { colors } from "@/libs/colors";
import type { User as UserType } from "@/types/user";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

// Mock user data based on SQL schema
const mockUser: UserType = {
	user_id: 12,
	username: "Nam Nguyen",
	email: "nam@example.com",
	avatar_url: "default_avatar.png",
	phone: "0123456789",
	role: "user",
	balance: 500000,
	bank_name: "Techcombank",
	bank_account_number: "1234567890",
	bank_account_holder: "NGUYEN VAN NAM",
	created_at: new Date().toISOString(),
	is_active: true,
};

export default function User() {
	const [initializing, setInitializing] = useState(true);
	const [user, setUser] = useState();

	function handleAuthStateChanged(_user: any) {
		setUser(_user);
		if (initializing) setInitializing(false);
	}

	useEffect(() => {
		const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
		return subscriber;
	}, []);

	if (initializing) return null;

	return (
		<View style={styles.container}>
			<Background />

			{/* Background decorative elements */}
			<View style={styles.decorativeBackground}>
				{/* Top glow */}
				{/* Bottom gold accent */}
				<View style={styles.bottomGlow} />
			</View>

			{/* Content */}
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Profile Header */}
				<ProfileAvatar
					avatarUrl={mockUser.avatar_url}
					username={mockUser.username}
					userId={mockUser.user_id}
				/>

				{/* Menu Card */}
				<ProfileMenuCard />
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: "relative",
	},
	decorativeBackground: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		overflow: "hidden",
		pointerEvents: "none",
	},
	bottomGlow: {
		position: "absolute",
		bottom: -80,
		left: "50%",
		width: "100%",
		height: 160,
		backgroundColor: `${colors["lol-gold"]}0D`,
		transform: [{ translateX: -192 }],
	},
	scrollView: {
		flex: 1,
		position: "relative",
		zIndex: 10,
	},
	scrollContent: {
		paddingBottom: 100,
		gap: 24,
	},
});
