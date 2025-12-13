import { getAccountById } from "@/actions/account.action";
import { getUserOrders } from "@/actions/order.action";
import { getUserById } from "@/actions/user.action";
import Background from "@/components/Background";
import OrderCard from "@/components/cart/OrderCard";
import OrderDetailSheet from "@/components/cart/OrderDetailSheet";
import { colors } from "@/libs/colors";
import type { Order as FirestoreOrder } from "@/types";
import type { Order } from "@/types/order";
import { getApp } from "@react-native-firebase/app";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft, History, Minus, Plus, Wallet } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

// Helper function to convert Firestore Order to OrderCard format
const mapFirestoreOrderToOrderCard = async (
	firestoreOrder: FirestoreOrder
): Promise<Order[]> => {
	if (!firestoreOrder.items || firestoreOrder.items.length === 0) {
		return [];
	}

	// Map each item in the order to a separate OrderCard
	const mappedOrders = await Promise.all(
		firestoreOrder.items.map(async (item, index) => {
			const orderId = firestoreOrder.id || "";
			const numericOrderId = parseInt(orderId.slice(0, 8), 16) || 0;
			const numericAccountId = parseInt(item.accountId.slice(0, 8), 16) || 0;
			const numericUserId = parseInt(firestoreOrder.buyerId.slice(0, 8), 16) || 0;

			// Try to get account details for avatar and rank
			let accountAvatar = "";
			let accountRank = "Unknown";
			try {
				const account = await getAccountById(item.accountId);
				if (account) {
					accountAvatar = account.thumbnailUrl || "";
					const soloRank = account.soloRank?.tier || account.flexRank?.tier || "Unranked";
					const soloDivision = account.soloRank?.division || account.flexRank?.division || "";
					const soloLP = account.soloRank?.lp || account.flexRank?.lp || 0;
					accountRank = soloDivision 
						? `${soloRank} ${soloDivision} - ${soloLP}LP`
						: soloRank;
				}
			} catch (err) {
				console.error("Error fetching account details:", err);
			}

			// Calculate rent_days from rentDurationHours
			const rentDays = item.rentDurationHours 
				? Math.ceil(item.rentDurationHours / 24) 
				: undefined;

			// Format rent_end_date
			const rentEndDate = item.rentEndDate 
				? item.rentEndDate.toDate().toISOString() 
				: undefined;

			// Format dates
			const createdAt = firestoreOrder.createdAt 
				? firestoreOrder.createdAt.toDate().toISOString() 
				: new Date().toISOString();
			const updatedAt = firestoreOrder.updatedAt 
				? firestoreOrder.updatedAt.toDate().toISOString() 
				: createdAt;

			// Get account name from snapshot or default
			const accountName = item.accountTitleSnapshot || "Unknown";

			return {
				order_id: numericOrderId + index, // Unique ID for each item
				user_id: numericUserId,
				account_id: numericAccountId,
				account_firestore_id: item.accountId, // Store Firestore ID for credentials
				account_name: accountName,
				account_avatar: accountAvatar || "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/5367.png",
				rank: accountRank,
				type: item.transactionType === "purchase" ? "purchase" : "rent",
				status: firestoreOrder.status,
				amount: item.price,
				rent_days: rentDays,
				rent_end_date: rentEndDate,
				created_at: createdAt,
				updated_at: updatedAt,
			} as Order;
		})
	);

	return mappedOrders;
};

export default function Cart() {
	const [initializing, setInitializing] = useState(true);
	const [authUser, setAuthUser] = useState<FirebaseAuthTypes.User | null>(null);
	const [userBalance, setUserBalance] = useState(0);
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"all" | "purchase" | "rent">("all");
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [sheetVisible, setSheetVisible] = useState(false);

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
			if (user) {
				setUserBalance(user.balance);
			}
		} catch (err) {
			console.error("Error fetching user data:", err);
		}
	}, [authUser]);

	const fetchOrders = useCallback(async () => {
		if (!authUser?.uid) {
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);
			const firestoreOrders = await getUserOrders(authUser.uid);
			
			// Map Firestore orders to OrderCard format
			const mappedOrdersPromises = firestoreOrders.map((firestoreOrder) =>
				mapFirestoreOrderToOrderCard(firestoreOrder)
			);
			const mappedOrdersArrays = await Promise.all(mappedOrdersPromises);
			const mappedOrders = mappedOrdersArrays.flat();

			setOrders(mappedOrders);
		} catch (err) {
			console.error("Error fetching orders:", err);
			setError("Không thể tải lịch sử giao dịch");
		} finally {
			setLoading(false);
		}
	}, [authUser]);

	useEffect(() => {
		if (!initializing) {
			fetchUserData();
			fetchOrders();
		}
	}, [initializing, fetchUserData, fetchOrders]);

	useFocusEffect(
		useCallback(() => {
			if (!initializing) {
				fetchUserData();
				fetchOrders();
			}
		}, [initializing, fetchUserData, fetchOrders])
	);

	const purchaseOrders = orders.filter((o) => o.type === "purchase");
	const rentOrders = orders.filter((o) => o.type === "rent");

	const getFilteredOrders = () => {
		switch (activeTab) {
			case "purchase":
				return purchaseOrders;
			case "rent":
				return rentOrders;
			default:
				return orders;
		}
	};

	const handleDeposit = () => {
		router.push("/profile");
	};

	const handleWithdraw = () => {
		router.push("/profile");
	};

	return (
		<View style={styles.container}>
			<Background />

			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
					<ArrowLeft size={20} color={colors.foreground} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
				<View style={{ width: 40 }} />
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Balance Card */}
				<View style={styles.balanceCard}>
					{/* Decorative elements */}
					<View style={styles.balanceGlowTop} />
					<View style={styles.balanceGlowBottom} />

					<View style={styles.balanceContent}>
						<View style={styles.balanceHeader}>
							<Wallet size={20} color={colors.mutedForeground} />
							<Text style={styles.balanceLabel}>Số dư hiện tại</Text>
						</View>
						<Text style={styles.balanceAmount}>
							{userBalance.toLocaleString("vi-VN")}
							<Text style={styles.balanceCurrency}>đ</Text>
						</Text>
						<View style={styles.balanceActions}>
							<TouchableOpacity
								style={styles.depositButton}
								onPress={handleDeposit}
							>
								<Plus size={16} color={colors.primaryForeground} />
								<Text style={styles.depositButtonText}>Nạp tiền</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.withdrawButton}
								onPress={handleWithdraw}
							>
								<Minus size={16} color={colors.foreground} />
								<Text style={styles.withdrawButtonText}>Rút tiền</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>

				{/* Order History Section */}
				<View style={styles.historySection}>
					<View style={styles.historyHeader}>
						<History size={20} color={colors.primary} />
						<Text style={styles.historyTitle}>Lịch sử giao dịch</Text>
					</View>

					{/* Tabs */}
					<View style={styles.tabs}>
						<TouchableOpacity
							style={[styles.tab, activeTab === "all" && styles.tabActive]}
							onPress={() => setActiveTab("all")}
						>
							<Text
								style={[
									styles.tabText,
									activeTab === "all" && styles.tabTextActive,
								]}
							>
								Tất cả ({orders.length})
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.tab, activeTab === "purchase" && styles.tabActive]}
							onPress={() => setActiveTab("purchase")}
						>
							<Text
								style={[
									styles.tabText,
									activeTab === "purchase" && styles.tabTextActive,
								]}
							>
								Mua ({purchaseOrders.length})
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.tab, activeTab === "rent" && styles.tabActive]}
							onPress={() => setActiveTab("rent")}
						>
							<Text
								style={[
									styles.tabText,
									activeTab === "rent" && styles.tabTextActive,
								]}
							>
								Thuê ({rentOrders.length})
							</Text>
						</TouchableOpacity>
					</View>

					{/* Orders List */}
					{loading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" color={colors.primary} />
							<Text style={styles.loadingText}>Đang tải...</Text>
						</View>
					) : error ? (
						<View style={styles.errorContainer}>
							<Text style={styles.errorText}>{error}</Text>
						</View>
					) : (
						<View style={styles.ordersList}>
							{getFilteredOrders().length === 0 ? (
								<View style={styles.emptyContainer}>
									<Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
								</View>
							) : (
								getFilteredOrders().map((order, index) => (
									<OrderCard 
										key={`${order.order_id}-${index}`} 
										order={order}
										onPress={(order) => {
											setSelectedOrder(order);
											setSheetVisible(true);
										}}
									/>
								))
							)}
						</View>
					)}
				</View>
			</ScrollView>

			<OrderDetailSheet
				visible={sheetVisible}
				order={selectedOrder}
				onClose={() => {
					setSheetVisible(false);
					setSelectedOrder(null);
				}}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingTop: 60,
		paddingBottom: 16,
		backgroundColor: `${colors.card}CC`,
		borderBottomWidth: 1,
		borderBottomColor: `${colors.border}80`,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: `${colors.card}CC`,
		borderWidth: 1,
		borderColor: `${colors.border}80`,
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: {
		fontSize: 18,
		fontFamily: "Inter_700Bold",
		color: colors.foreground,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
		gap: 16,
		paddingBottom: 32,
	},
	balanceCard: {
		position: "relative",
		backgroundColor: colors.card,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: `${colors.primary}4D`,
		padding: 20,
		overflow: "hidden",
	},
	balanceGlowTop: {
		position: "absolute",
		top: 0,
		right: 0,
		width: 128,
		height: 128,
		backgroundColor: `${colors.primary}1A`,
		borderRadius: 64,
	},
	balanceGlowBottom: {
		position: "absolute",
		bottom: 0,
		left: 0,
		width: 96,
		height: 96,
		backgroundColor: `${colors.accent}1A`,
		borderRadius: 48,
	},
	balanceContent: {
		position: "relative",
		zIndex: 1,
	},
	balanceHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 8,
	},
	balanceLabel: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	balanceAmount: {
		fontSize: 32,
		fontFamily: "Inter_700Bold",
		color: colors.foreground,
		marginBottom: 16,
	},
	balanceCurrency: {
		fontSize: 18,
		color: colors.primary,
		marginLeft: 4,
	},
	balanceActions: {
		flexDirection: "row",
		gap: 8,
	},
	depositButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		backgroundColor: colors.primary,
		paddingVertical: 12,
		borderRadius: 12,
	},
	depositButtonText: {
		fontSize: 14,
		fontFamily: "Inter_600SemiBold",
		color: colors.primaryForeground,
	},
	withdrawButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		backgroundColor: `${colors.card}80`,
		borderWidth: 1,
		borderColor: colors.border,
		paddingVertical: 12,
		borderRadius: 12,
	},
	withdrawButtonText: {
		fontSize: 14,
		fontFamily: "Inter_600SemiBold",
		color: colors.foreground,
	},
	historySection: {
		gap: 16,
	},
	historyHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	historyTitle: {
		fontSize: 18,
		fontFamily: "Inter_700Bold",
		color: colors.foreground,
	},
	tabs: {
		flexDirection: "row",
		backgroundColor: `${colors.card}99`,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: `${colors.border}80`,
		padding: 4,
	},
	tab: {
		flex: 1,
		paddingVertical: 10,
		alignItems: "center",
		borderRadius: 8,
	},
	tabActive: {
		backgroundColor: colors.primary,
	},
	tabText: {
		fontSize: 12,
		fontFamily: "Inter_500Medium",
		color: colors.mutedForeground,
	},
	tabTextActive: {
		color: colors.primaryForeground,
		fontFamily: "Inter_600SemiBold",
	},
	ordersList: {
		gap: 12,
	},
	loadingContainer: {
		padding: 32,
		alignItems: "center",
		justifyContent: "center",
		gap: 16,
	},
	loadingText: {
		color: colors.mutedForeground,
		fontSize: 14,
	},
	errorContainer: {
		padding: 32,
		alignItems: "center",
		justifyContent: "center",
	},
	errorText: {
		color: colors.destructive,
		fontSize: 14,
		textAlign: "center",
	},
	emptyContainer: {
		padding: 32,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyText: {
		color: colors.mutedForeground,
		fontSize: 14,
	},
});