import { getRentableAccounts } from "@/actions/account.action";
import { getUserById } from "@/actions/user.action";
import Background from "@/components/Background";
import RentModal from "@/components/book/RentModal";
import Badge from "@/components/ui/Badge";
import { colors } from "@/libs/colors";
import type { LolAccount, User } from "@/types";
import { getApp } from "@react-native-firebase/app";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Image as RNImage,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const rankImages = {
	CaoThu: require("@/assets/images/rank/cao-thu.png"),
	BachKim: require("@/assets/images/rank/bach-kim.png"),
};

const icons = {
	cart: require("@/assets/icons/cart.png"),
};

export default function Book() {
	const [initializing, setInitializing] = useState(true);
	const [authUser, setAuthUser] = useState<FirebaseAuthTypes.User | null>(null);
	const [userData, setUserData] = useState<User | null>(null);
	const [accounts, setAccounts] = useState<LolAccount[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [rentModalVisible, setRentModalVisible] = useState(false);
	const [selectedAccount, setSelectedAccount] = useState<LolAccount | null>(null);

	const handleAuthStateChanged = useCallback((_user: FirebaseAuthTypes.User | null) => {
		setAuthUser(_user);
		if (initializing) setInitializing(false);
	}, [initializing]);

	useEffect(() => {
		const app = getApp();
		const auth = getAuth(app);
		const subscriber = onAuthStateChanged(auth, handleAuthStateChanged);
		return subscriber;
	}, [handleAuthStateChanged]);

	const fetchUserData = useCallback(async () => {
		if (!authUser?.uid) {
			setLoading(false);
			return;
		}

		try {
			const user = await getUserById(authUser.uid);
			setUserData(user);
		} catch (err) {
			console.error("Error fetching user data:", err);
		}
	}, [authUser]);

	const fetchRentableAccounts = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const rentableAccounts = await getRentableAccounts();

			// Filter out sold accounts
			const filteredAccounts = rentableAccounts.filter(
				(account: LolAccount) => account.status !== "sold"
			);

			// Sort: available lên đầu, renting xuống cuối
			const sortedAccounts = filteredAccounts.sort((a: LolAccount, b: LolAccount) => {
				if (a.status === "available" && b.status === "renting") return -1;
				if (a.status === "renting" && b.status === "available") return 1;
				return 0;
			});

			setAccounts(sortedAccounts);
		} catch (err) {
			console.error("Error fetching rentable accounts:", err);
			setError("Không thể tải danh sách tài khoản cho thuê");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!initializing) {
			fetchUserData();
			fetchRentableAccounts();
		}
	}, [initializing, fetchUserData, fetchRentableAccounts]);

	useFocusEffect(
		useCallback(() => {
			if (!initializing) {
				fetchUserData();
				fetchRentableAccounts();
			}
		}, [initializing, fetchUserData, fetchRentableAccounts])
	);

	const handleNavigateToCart = () => {
		router.push("/cart");
	};

	const handleRent = (account: LolAccount) => {
		setSelectedAccount(account);
		setRentModalVisible(true);
	};

	const handleRentSuccess = () => {
		// Refetch accounts after successful rent
		fetchRentableAccounts();
	};

	const handleCardPress = (account: LolAccount) => {
		// Navigate to detail page with account ID
		const accountId = account.id;
		if (!accountId) {
			console.error("Invalid account ID for detail view");
			return;
		}
		router.push(`/detail-acc/${accountId}`);
	};

	const formatPrice = (price: number) => {
		return price.toLocaleString("vi-VN", {
			style: "currency",
			currency: "VND",
		});
	};

	const isMyAccount = (account: LolAccount) => {
		return authUser?.uid === account.sellerId;
	};

	const rows = Array.from(
		{ length: Math.ceil(accounts.length / 2) },
		(_, index) => ({
			row: index,
			data: accounts.slice(index * 2, index * 2 + 2),
		}),
	);

	if (loading || initializing) {
		return (
			<View style={styles.container}>
				<Background />
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors["lol-gold"]} />
					<Text style={styles.loadingText}>Đang tải...</Text>
				</View>
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.container}>
				<Background />
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>{error}</Text>
					<TouchableOpacity onPress={fetchRentableAccounts} style={styles.retryButton}>
						<Text style={styles.retryButtonText}>Thử lại</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Background />
			<View style={styles.header}>
				<View style={styles.balanceContainer}>
					{userData && (
						<Text style={styles.balanceText}>
							{userData.balance.toLocaleString("vi-VN")} ₫
						</Text>
					)}
				</View>
				<TouchableOpacity onPress={handleNavigateToCart}>
					<RNImage source={icons.cart} style={styles.icon} />
				</TouchableOpacity>
			</View>

			<ScrollView 
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.content}>
					{rows.map((row) => (
						<View style={cardStyles.container} key={row.row}>
							{row.data.map((account) => {
								const isOwner = isMyAccount(account);
								const isRenting = account.status === "renting";
								
								return (
									<TouchableOpacity 
										style={cardStyles.card} 
										key={account.id}
										onPress={() => handleCardPress(account)}
										activeOpacity={0.8}
									>
										<View style={cardStyles.imageContainer}>
											<Image 
												source={{ uri: account.thumbnailUrl }} 
												style={cardStyles.image}
												contentFit="cover"
											/>
											{isOwner && (
												<View style={cardStyles.badgeContainer}>
													<Badge 
														text={isRenting ? "Đang thuê" : "Đang trống"} 
														color={isRenting ? colors["lol-gold"] : "#02AFAC"}
													/>
												</View>
											)}
										</View>
										<View style={cardStyles.accountNameContainer}>
											<Text style={cardStyles.accountName} numberOfLines={1}>
												{account.ingameName || account.title || "Unknown"}
											</Text>
										</View>
										<View style={cardStyles.header}>
											<View style={cardStyles.info}>
												<View style={cardStyles.infoSquareContainer}>
													<View style={cardStyles.infoSquare} />
													<Text style={cardStyles.infoText}>
														Rank: {account.soloRank?.tier || account.flexRank?.tier || "Unranked"}
													</Text>
												</View>
												<View style={cardStyles.infoSquareContainer}>
													<View style={cardStyles.infoSquare} />
													<Text style={cardStyles.infoText}>
														Skin: {account.skinCount || 0}
													</Text>
												</View>
												<View style={cardStyles.infoSquareContainer}>
													<View style={cardStyles.infoSquare} />
													<Text style={cardStyles.infoText}>
														Champ: {account.champCount || 0}
													</Text>
												</View>
											</View>
										</View>
										{isRenting && (
											<View style={timeLeftStyles.container}>
												<Text style={timeLeftStyles.timeLeftText}>Đang được thuê</Text>
											</View>
										)}
										<Text style={rentPriceStyles.text}>
											{formatPrice(account.rentPricePerHour || 0)}/giờ
										</Text>
										{!isRenting && (
											<TouchableOpacity 
												style={cardStyles.rentButton}
												onPress={(e) => {
													e.stopPropagation();
													handleRent(account);
												}}
												activeOpacity={0.7}
											>
												<Text style={cardStyles.rentButtonText}>Thuê</Text>
											</TouchableOpacity>
										)}
									</TouchableOpacity>
								);
							})}
						</View>
					))}
					{accounts.length === 0 && (
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyText}>Không có tài khoản nào cho thuê</Text>
						</View>
					)}
				</View>
			</ScrollView>

			<RentModal
				visible={rentModalVisible}
				account={selectedAccount}
				userBalance={userData?.balance || 0}
				onClose={() => {
					setRentModalVisible(false);
					setSelectedAccount(null);
				}}
				onRentSuccess={handleRentSuccess}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: "relative",
		paddingTop: 24,
		backgroundColor: colors["lol-black"],
	},
	icon: {
		width: 36,
		height: 36,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
	},
	balanceContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	balanceText: {
		color: colors["lol-gold"],
		fontSize: 16,
		fontFamily: "Inter_700Bold",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 100,
		paddingTop: 24,
	},
	content: {
		gap: 24,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 16,
	},
	loadingText: {
		color: colors["lol-gold"],
		fontSize: 16,
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
		gap: 16,
	},
	errorText: {
		color: "#fff",
		fontSize: 16,
		textAlign: "center",
	},
	retryButton: {
		backgroundColor: colors["lol-gold"],
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	retryButtonText: {
		color: "#000",
		fontSize: 16,
		fontFamily: "Inter_700Bold",
	},
	emptyContainer: {
		padding: 32,
		alignItems: "center",
		justifyContent: "center",
		minHeight: 200,
	},
	emptyText: {
		color: "#CABB8E",
		fontSize: 16,
		textAlign: "center",
	},
});

const cardStyles = StyleSheet.create({
	container: {
		flexDirection: "row",
		gap: 16,
		justifyContent: "space-between",
		paddingHorizontal: 16,
		marginBottom: 24,
	},
	card: {
		backgroundColor: "#012026",
		flex: 1,
		maxWidth: "48%",
		borderColor: colors["lol-gold"],
		borderWidth: 1,
		gap: 8,
		justifyContent: 'center',
		paddingVertical: 8,
	},
	imageContainer: {
		position: "relative",
		width: "100%",
		height: 120,
		paddingHorizontal: 4,
	},
	accountNameContainer: {
		paddingHorizontal: 8,
		marginBottom: 4,
	},
	accountName: {
		color: "#fff",
		fontSize: 14,
		fontFamily: "Inter_600SemiBold",
		textAlign: "center",
	},
	image: {
		width: "100%",
		height: "100%",
		borderRadius: 4,
	},
	badgeContainer: {
		position: "absolute",
		top: 8,
		right: 12,
		zIndex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		justifyContent: 'center',
		paddingHorizontal: 4,
	},
	info: {
		flex: 1,
		gap: 4,
	},
	infoSquareContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	infoSquare: {
		width: 10,
		height: 10,
		backgroundColor: "#045160",
	},
	infoText: {
		color: "#fff",
		fontSize: 12,
	},
	rentButton: {
		backgroundColor: colors["lol-gold"],
		paddingVertical: 8,
		marginHorizontal: 8,
		borderRadius: 4,
		alignItems: "center",
		marginTop: 4,
	},
	rentButtonText: {
		color: "#000",
		fontSize: 16,
		fontFamily: "Inter_700Bold",
	},
});

const timeLeftStyles = StyleSheet.create({
	container: {
		backgroundColor: "black",
		padding: 8,
		borderColor: colors["lol-gold"],
		borderWidth: 1,
		borderStartWidth: 0,
		borderEndWidth: 0,
	},
	timeLeftText: {
		fontSize: 14,
		textAlign: 'center',
		color: colors["lol-gold"],
		fontFamily: "Inter_700Bold",
	},
});

const rentPriceStyles = StyleSheet.create({
	text: {
		fontSize: 20,
		color: '#FBE707',
		fontFamily: "Inter_700Bold",
		textAlign: 'center',
		paddingTop: 8,
	},
});
