import { getAccountsBySellerId } from "@/actions/account.action";
import { getOrdersByAccountId } from "@/actions/order.action";
import { getUserById } from "@/actions/user.action";
import Background from "@/components/Background";
import ListView from "@/components/home/ListView";
import { colors } from '@/libs/colors';
import type { LolAccount } from "@/types";
import type { Item } from "@/types/items";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getApp } from "@react-native-firebase/app";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const icons = {
	cart: require("@/assets/icons/cart.png"),
};

// Helper function to convert LolAccount to Item
const mapAccountToItem = (account: LolAccount): Item => {
	// Map AccountStatus to Item status
	const mapStatus = (status: string): "available" | "rented" | "sold" => {
		if (status === "renting") return "rented";
		if (status === "sold") return "sold";
		return "available";
	};

	// Join ranks with "|" separator
	const ranks: string[] = [];
	if (account.soloRank?.tier) {
		ranks.push(account.soloRank.tier);
	}
	if (account.flexRank?.tier) {
		ranks.push(account.flexRank.tier);
	}
	if (account.tftRank?.tier) {
		ranks.push(account.tftRank.tier);
	}
	const rankString = ranks.length > 0 ? ranks.join(" | ") : "Unranked";

	return {
		id: account.id ? parseInt(account.id.slice(0, 8), 16) || 0 : 0,
		firestoreId: account.id || undefined, // Lưu Firestore ID gốc
		name: account.ingameName || account.title || "Unknown",
		description: account.description || "",
		rank: rankString,
		level: account.level || 0,
		championCount: account.champCount || 0,
		skinCount: account.skinCount || 0,
		blueEssence: 0,
		riotPoints: 0,
		notableSkins: "",
		rentPrice: account.rentPricePerHour || 0,
		buyPrice: account.buyPrice || 0,
		status: mapStatus(account.status),
		image: account.thumbnailUrl || "",
	};
};

export default function DangBan() {
	const [initializing, setInitializing] = useState(true);
	const [authUser, setAuthUser] = useState<FirebaseAuthTypes.User | null>(null);
	const [data, setData] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [ownerIds, setOwnerIds] = useState<Map<number, boolean>>(new Map());
	const [isAdmin, setIsAdmin] = useState(false);

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

	const fetchAccounts = useCallback(async () => {
		if (!authUser?.uid) {
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);
			
			// Check if user is admin
			const userData = await getUserById(authUser.uid);
			const isUserAdmin = userData?.role === "admin";
			if (userData) {
				setIsAdmin(isUserAdmin);
			}

			const result = await getAccountsBySellerId(authUser.uid);
			
			// Map accounts to items and fetch buyer info for sold/rented accounts
			const itemsPromises = result.accounts.map(async (account: LolAccount) => {
				const item = mapAccountToItem(account);
				
				// If account is sold or renting, get buyer info
				if (account.status === "sold" || account.status === "renting") {
					try {
						const orders = await getOrdersByAccountId(account.id || "");
						if (orders.length > 0) {
							// Get the most recent order
							const latestOrder = orders[0];
							const orderItem = latestOrder.items.find(item => item.accountId === account.id);
							
							if (orderItem && latestOrder.buyerId) {
								// Get buyer info
								const buyerData = await getUserById(latestOrder.buyerId);
								item.buyerInfo = {
									buyerId: latestOrder.buyerId,
									buyerName: buyerData?.username || buyerData?.email || "Unknown",
									transactionType: orderItem.transactionType,
									rentEndDate: orderItem.rentEndDate?.toDate(),
								};
							}
						}
					} catch (err) {
						console.error("Error fetching buyer info:", err);
					}
				}
				
				return item;
			});
			
			const items = await Promise.all(itemsPromises);
			setData(items);

			// Create map of owner IDs - all accounts in this page are owned by the user, or admin can edit
			// But don't allow editing if account is sold
			if (authUser?.uid) {
				const ownerMap = new Map<number, boolean>();
				result.accounts.forEach((account: LolAccount) => {
					const itemId = account.id ? parseInt(account.id.slice(0, 8), 16) || 0 : 0;
					// User owns the account OR user is admin, BUT only if account is not sold
					const isOwner = (account.sellerId === authUser.uid || isUserAdmin) && account.status !== "sold";
					ownerMap.set(itemId, isOwner);
				});
				setOwnerIds(ownerMap);
			}
		} catch (err) {
			console.error("Error fetching accounts:", err);
			setError("Không thể tải danh sách bài đăng");
		} finally {
			setLoading(false);
		}
	}, [authUser]);

	useEffect(() => {
		if (!initializing) {
			fetchAccounts();
		}
	}, [initializing, fetchAccounts]);

	// Refetch data when tab is focused
	useFocusEffect(
		useCallback(() => {
			if (authUser?.uid) {
				fetchAccounts();
			}
		}, [authUser, fetchAccounts])
	);

	const handleNavigateToCart = () => {
		router.push("/cart");
	};

	if (initializing || loading) {
		return (
			<View style={styles.container}>
				<Background />
				<StatusBar barStyle="light-content" />
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
				<StatusBar barStyle="light-content" />
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>{error}</Text>
					<TouchableOpacity onPress={fetchAccounts} style={styles.retryButton}>
						<Text style={styles.retryButtonText}>Thử lại</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	if (!authUser) {
		return (
			<View style={styles.container}>
				<Background />
				<StatusBar barStyle="light-content" />
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>Vui lòng đăng nhập để xem bài đăng</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Background />
			<StatusBar barStyle="light-content" />
			<ScrollView style={styles.scrollView}>
				<View>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.push("/new")}>
							<Ionicons name="add-circle" size={32} color={colors["lol-gold"]} />
						</TouchableOpacity>
						<TouchableOpacity onPress={handleNavigateToCart}>
							<Image source={icons.cart} style={styles.icon} />
						</TouchableOpacity>
					</View>

					<View>
						<View style={listViewStyles.dividerContainer}>
							<View style={listViewStyles.divider} />
							<Text style={listViewStyles.dividerText}>Bài đã đăng</Text>
							<View style={listViewStyles.divider} />
						</View>
						{data.length === 0 ? (
							<View style={styles.emptyContainer}>
								<Text style={styles.emptyText}>Chưa có bài đăng nào</Text>
								<TouchableOpacity onPress={() => router.push("/new")} style={styles.addButton}>
									<Ionicons name="add-circle" size={24} color={colors["lol-gold"]} />
									<Text style={styles.addButtonText}>Đăng bán ngay</Text>
								</TouchableOpacity>
							</View>
						) : (
							<ListView data={data} showBuyNowButton={false} ownerIds={ownerIds} showBuyerInfo={true} />
						)}
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	container: {
		flex: 1,
		paddingTop: 24,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
	},
	icon: {
		width: 36,
		height: 36,
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
		gap: 16,
	},
	emptyText: {
		color: "#CABB8E",
		fontSize: 16,
		textAlign: "center",
	},
	addButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: "rgba(202, 187, 142, 0.2)",
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors["lol-gold"],
	},
	addButtonText: {
		color: colors["lol-gold"],
		fontSize: 16,
		fontFamily: "Inter_700Bold",
	},
});

const listViewStyles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 16,
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		padding: 16,
	},
	divider: {
		height: 1,
		backgroundColor: "#9F9168",
		flex: 1,
	},
	dividerText: {
		color: "#CABB8E",
		fontSize: 16,
		fontFamily: "Inter_700Bold",
		textAlign: "center",
	},
});
