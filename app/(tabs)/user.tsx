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

				{/* User Info Card */}
				<View style={styles.infoCard}>
					{/* Balance Section */}
					<View style={styles.balanceSection}>
						<Text style={styles.balanceLabel}>Số dư tài khoản</Text>
						<Text style={styles.balanceAmount}>
							{userData.balance.toLocaleString("vi-VN")} ₫
						</Text>
					</View>

					{/* Divider */}
					<View style={styles.divider} />

					{/* User Details */}
					<View style={styles.detailsSection}>
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Email:</Text>
							<Text style={styles.detailValue}>{userData.email}</Text>
						</View>

						{userData.phone && (
							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Số điện thoại:</Text>
								<Text style={styles.detailValue}>{userData.phone}</Text>
							</View>
						)}

						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Vai trò:</Text>
							<View style={styles.roleBadge}>
								<Text style={styles.roleText}>
									{userData.role === "admin" ? "Quản trị viên" : "Người dùng"}
								</Text>
							</View>
						</View>

						{userData.bankName && (
							<>
								<View style={styles.divider} />
								<Text style={styles.sectionTitle}>Thông tin ngân hàng</Text>
								<View style={styles.detailRow}>
									<Text style={styles.detailLabel}>Ngân hàng:</Text>
									<Text style={styles.detailValue}>{userData.bankName}</Text>
								</View>
								{userData.bankAccountNumber && (
									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>Số tài khoản:</Text>
										<Text style={styles.detailValue}>
											{userData.bankAccountNumber}
										</Text>
									</View>
								)}
								{userData.bankAccountHolder && (
									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>Chủ tài khoản:</Text>
										<Text style={styles.detailValue}>
											{userData.bankAccountHolder}
										</Text>
									</View>
								)}
							</>
						)}
					</View>
				</View>

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
	infoCard: {
		marginHorizontal: 16,
		backgroundColor: `${colors.card}80`,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: `${colors.border}4D`,
		overflow: "hidden",
	},
	balanceSection: {
		padding: 20,
		backgroundColor: `${colors["lol-gold"]}0D`,
		alignItems: "center",
	},
	balanceLabel: {
		fontSize: 14,
		color: "#C8AA6E",
		marginBottom: 8,
		fontWeight: "500",
	},
	balanceAmount: {
		fontSize: 32,
		fontWeight: "bold",
		color: colors["lol-gold"],
	},
	divider: {
		height: 1,
		backgroundColor: `${colors.border}33`,
	},
	detailsSection: {
		padding: 16,
		gap: 12,
	},
	detailRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	detailLabel: {
		fontSize: 14,
		color: "#C8AA6E",
		fontWeight: "500",
	},
	detailValue: {
		fontSize: 14,
		color: "#F0E6D2",
		fontWeight: "600",
		flex: 1,
		textAlign: "right",
	},
	roleBadge: {
		paddingHorizontal: 12,
		paddingVertical: 4,
		backgroundColor: `${colors.primary}1A`,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: `${colors.primary}33`,
	},
	roleText: {
		fontSize: 12,
		color: colors.primary,
		fontWeight: "600",
	},
	sectionTitle: {
		fontSize: 14,
		color: "#F0E6D2",
		fontWeight: "600",
		marginTop: 4,
	},
});
