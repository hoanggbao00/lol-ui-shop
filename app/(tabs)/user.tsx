import { getUserById } from "@/actions/user.action";
import Background from "@/components/Background";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileMenuCard from "@/components/profile/ProfileMenuCard";
import { colors } from "@/libs/colors";
import type { User } from "@/types";
import { getApp } from "@react-native-firebase/app";
import {
	type FirebaseAuthTypes,
	getAuth,
	onAuthStateChanged,
} from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

export default function UserScreen() {
	const [initializing, setInitializing] = useState(true);
	const [authUser, setAuthUser] = useState<FirebaseAuthTypes.User | null>(null);
	const [userData, setUserData] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	function handleAuthStateChanged(_user: FirebaseAuthTypes.User | null) {
		setAuthUser(_user);
		if (initializing) setInitializing(false);
	}

	useEffect(() => {
		const app = getApp();
		const auth = getAuth(app);
		const subscriber = onAuthStateChanged(auth, handleAuthStateChanged);
		return subscriber;
	}, []);

	// Fetch user data from Firestore when auth user is available
	useEffect(() => {
		const fetchUserData = async () => {
			if (authUser?.uid) {
				try {
					setLoading(true);
					const user = await getUserById(authUser.uid);
					setUserData(user);
				} catch (error) {
					console.error("Error fetching user data:", error);
				} finally {
					setLoading(false);
				}
			} else {
				setLoading(false);
			}
		};

		if (!initializing) {
			fetchUserData();
		}
	}, [authUser, initializing]);

	if (initializing || loading) {
		return (
			<View style={[styles.container, styles.centerContent]}>
				<Background />
				<ActivityIndicator size="large" color={colors["lol-gold"]} />
			</View>
		);
	}

	if (!authUser || !userData) {
		return (
			<View style={[styles.container, styles.centerContent]}>
				<Background />
				<Text style={styles.errorText}>
					Vui lòng đăng nhập để xem thông tin
				</Text>
			</View>
		);
	}

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
					avatarUrl={userData.avatarUrl}
					username={userData.username}
					userId={userData.uid}
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
	centerContent: {
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		color: colors["lol-gold"],
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
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
