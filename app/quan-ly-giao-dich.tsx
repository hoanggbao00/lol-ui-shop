import { getAllOrders, getUserOrders } from "@/actions/order.action";
import { getAllTransactions, getUserTransactions } from "@/actions/transaction.action";
import { getUserById } from "@/actions/user.action";
import Background from "@/components/Background";
import TransactionDetailSheet from "@/components/admin/TransactionDetailSheet";
import { colors } from "@/libs/colors";
import type { Order, WalletTransaction } from "@/types";
import { getApp } from "@react-native-firebase/app";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft, Receipt } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Platform,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	ToastAndroid,
	TouchableOpacity,
	View,
} from "react-native";

export default function QuanLyGiaoDich() {
	const [initializing, setInitializing] = useState(true);
	const [authUser, setAuthUser] = useState<FirebaseAuthTypes.User | null>(null);
	const [userData, setUserData] = useState<any>(null);
	const [orders, setOrders] = useState<Order[]>([]);
	const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
	const [loading, setLoading] = useState(true);
	
	// Helper function to get timestamp for sorting
	const getTimestamp = useCallback((item: Order | WalletTransaction): number => {
		if (!item.createdAt) return 0;
		const createdAt = item.createdAt as any;
		if (typeof createdAt === 'object' && createdAt !== null) {
			if ('toMillis' in createdAt && typeof createdAt.toMillis === 'function') {
				return createdAt.toMillis();
			}
			if ('seconds' in createdAt && typeof createdAt.seconds === 'number') {
				return createdAt.seconds * 1000;
			}
			if (createdAt instanceof Date) {
				return createdAt.getTime();
			}
		}
		return 0;
	}, []);
	
	// Merge and sort all items (orders + transactions) by createdAt
	const allItems = useMemo(() => {
		const items: Array<{ type: 'order' | 'transaction'; data: Order | WalletTransaction }> = [];
		
		// Add orders
		orders.forEach(order => {
			items.push({ type: 'order', data: order });
		});
		
		// Add transactions
		walletTransactions.forEach(transaction => {
			items.push({ type: 'transaction', data: transaction });
		});
		
		// Sort by createdAt descending (newest first)
		return items.sort((a, b) => {
			return getTimestamp(b.data) - getTimestamp(a.data);
		});
	}, [orders, walletTransactions, getTimestamp]);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [selectedWalletTransaction, setSelectedWalletTransaction] = useState<WalletTransaction | null>(null);
	const [sheetVisible, setSheetVisible] = useState(false);
	const [buyerName, setBuyerName] = useState<string>("");

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
		if (authUser?.uid) {
			try {
				const user = await getUserById(authUser.uid);
				setUserData(user);
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		}
	}, [authUser]);

	const fetchOrders = useCallback(async () => {
		if (!authUser?.uid) return;
		
		try {
			setLoading(true);
			const isAdmin = userData?.role === "admin";
			
			if (isAdmin) {
				// Admin: Lấy tất cả giao dịch
				const [allOrders, allTransactions] = await Promise.all([
					getAllOrders(),
					getAllTransactions(),
				]);
				setOrders(allOrders);
				setWalletTransactions(allTransactions);
			} else {
				// User: Chỉ lấy giao dịch của chính họ
				const [userOrders, userTransactions] = await Promise.all([
					getUserOrders(authUser.uid),
					getUserTransactions(authUser.uid),
				]);
				setOrders(userOrders);
				setWalletTransactions(userTransactions);
			}
		} catch (error) {
			console.error("Error fetching transactions:", error);
			ToastAndroid.show("Không thể tải danh sách giao dịch", ToastAndroid.SHORT);
		} finally {
			setLoading(false);
		}
	}, [authUser?.uid, userData?.role]);

	const handleOrderPress = async (order: Order) => {
		try {
			// Get buyer name
			const buyer = await getUserById(order.buyerId);
			setBuyerName(buyer?.username || buyer?.email || "Unknown");
			setSelectedOrder(order);
			setSelectedWalletTransaction(null);
			setSheetVisible(true);
		} catch (error) {
			console.error("Error fetching buyer info:", error);
			setBuyerName("Unknown");
			setSelectedOrder(order);
			setSelectedWalletTransaction(null);
			setSheetVisible(true);
		}
	};

	const handleWalletTransactionPress = async (transaction: WalletTransaction) => {
		try {
			// Get user name
			const user = await getUserById(transaction.userId);
			setBuyerName(user?.username || user?.email || "Unknown");
			setSelectedWalletTransaction(transaction);
			setSelectedOrder(null);
			setSheetVisible(true);
		} catch (error) {
			console.error("Error fetching user info:", error);
			setBuyerName("Unknown");
			setSelectedWalletTransaction(transaction);
			setSelectedOrder(null);
			setSheetVisible(true);
		}
	};

	useEffect(() => {
		if (!initializing && authUser?.uid) {
			fetchUserData();
		}
	}, [initializing, authUser, fetchUserData]);

	useFocusEffect(
		useCallback(() => {
			if (authUser?.uid && userData) {
				fetchOrders();
			}
		}, [authUser, userData, fetchOrders])
	);

	const formatPrice = (price: number) => {
		return price.toLocaleString("vi-VN", {
			style: "currency",
			currency: "VND",
		});
	};

	const formatDate = (timestamp: any) => {
		if (!timestamp) return "N/A";
		const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
		return date.toLocaleString("vi-VN");
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "paid":
				return "#10B981";
			case "pending":
				return "#F59E0B";
			case "cancelled":
				return colors.destructive;
			default:
				return colors.mutedForeground;
		}
	};

	const getMethodText = (method: string) => {
		switch (method) {
			case "banking":
				return "Chuyển khoản ngân hàng";
			case "qr_code":
				return "QR Code";
			case "balance":
				return "Số dư";
			case "refund":
				return "Hoàn tiền";
			case "penalty":
				return "Phạt";
			case "sale":
				return "Bán tài khoản";
			case "rent":
				return "Thuê tài khoản";
			default:
				return method;
		}
	};

	const getStatusText = (status: string, method?: string) => {
		// Nếu status là "completed" và method là "refund" thì hiển thị "Đã hoàn tiền"
		if (status === "completed" && method === "refund") {
			return "Đã hoàn tiền";
		}
		
		switch (status) {
			case "paid":
				return "Đã thanh toán";
			case "pending":
				return "Chờ thanh toán";
			case "cancelled":
				return "Đã hủy";
			case "completed":
				return "Hoàn thành";
			case "refunded":
				return "Đã hoàn tiền";
			case "renting":
				return "Đang thuê";
			default:
				return status;
		}
	};

	const getTransactionTypeText = (type: string) => {
		switch (type) {
			case "deposit":
				return "Nạp balance";
			case "withdraw":
				return "Rút balance";
			default:
				return type;
		}
	};

	const getAmountDisplay = (transaction: WalletTransaction) => {
		// Cộng tiền: deposit (màu xanh), Trừ tiền: withdraw (màu đỏ)
		const isPositive = transaction.type === "deposit";
		const sign = isPositive ? "+" : "-";
		// Màu xanh cho deposit, màu đỏ cho withdraw
		const color = isPositive ? "#10B981" : "#EF4444"; // Green for deposit, Red for withdraw
		const amount = formatPrice(transaction.amount);
		
		return { sign, amount, color, fullText: `${sign}${amount}` };
	};

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
				<ActivityIndicator size="large" color={colors["lol-gold"]} />
			</View>
		);
	}

	// Get status bar height
	const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

	return (
		<View style={styles.container}>
			<Background />
			<StatusBar barStyle="light-content" />
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
				{/* Header */}
				<View style={[styles.header, { paddingTop: statusBarHeight }]}>
					<TouchableOpacity onPress={() => router.back()}>
						<ArrowLeft size={24} color={colors["lol-gold"]} />
					</TouchableOpacity>
					<Text style={styles.title}>
						{userData?.role === "admin" ? "Quản lý Giao dịch" : "Giao dịch của tôi"}
					</Text>
					<View style={{ width: 24 }} />
				</View>

				{/* Orders and Transactions List - Merged and Sorted */}
				{allItems.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
					</View>
				) : (
					<>
						{allItems.map((item) => {
							if (item.type === 'order') {
								const order = item.data as Order;
								// Get order type from first item
								const orderType = order.items?.[0]?.transactionType || "purchase";
								const isPurchase = orderType === "purchase";
								
								return (
									<TouchableOpacity
										key={`order-${order.id}`}
										style={styles.orderCard}
										onPress={() => handleOrderPress(order)}
										activeOpacity={0.7}
									>
									{/* Type Badge - Outside Card */}
									<View style={styles.orderTypeRow}>
										<View
											style={[
												styles.orderTypeBadge,
												{
													backgroundColor: isPurchase
														? `${colors.primary}33`
														: `${colors.accent}33`,
												},
											]}
										>
											<Text
												style={[
													styles.orderTypeText,
													{
														color: isPurchase ? colors.primary : colors.accent,
													},
												]}
											>
												{isPurchase ? "Mua tài khoản" : "Thuê tài khoản"}
											</Text>
										</View>
										<Text style={styles.orderAmountYellow}>
											{formatPrice(order.totalAmount)}
										</Text>
									</View>

									<View style={styles.orderHeader}>
										<View style={styles.orderIconContainer}>
											<Receipt size={24} color={colors["lol-gold"]} />
										</View>
										<View style={styles.orderInfo}>
											<Text style={styles.orderId}>ID: {order.id?.slice(0, 8) || "N/A"}</Text>
											<Text style={styles.orderBuyer}>Buyer ID: {order.buyerId.slice(0, 8)}</Text>
										</View>
										<View
											style={[
												styles.statusBadge,
												{ backgroundColor: `${getStatusColor(order.status)}1A` },
											]}
										>
											<Text
												style={[styles.statusText, { color: getStatusColor(order.status) }]}
											>
												{getStatusText(order.status)}
											</Text>
										</View>
									</View>
									<View style={styles.orderDetails}>
										{/* Items List */}
										{order.items && order.items.length > 0 && (
											<View style={styles.itemsContainer}>
												<Text style={styles.itemsLabel}>Tài khoản:</Text>
												{order.items.map((item, index) => (
													<View key={index} style={styles.itemRow}>
														<Text style={styles.itemName} numberOfLines={1}>
															• {item.accountTitleSnapshot || `Account ${item.accountId.slice(0, 8)}`}
														</Text>
														{item.rentDurationHours && (
															<Text style={styles.itemRentDuration}>
																({item.rentDurationHours}h)
															</Text>
														)}
													</View>
												))}
											</View>
										)}
										<Text style={styles.orderDate}>
											Ngày tạo: {formatDate(order.createdAt)}
										</Text>
									</View>
									</TouchableOpacity>
								);
							} else {
								const transaction = item.data as WalletTransaction;
								return (
									<TouchableOpacity
										key={`transaction-${transaction.id}`}
										style={styles.orderCard}
										onPress={() => handleWalletTransactionPress(transaction)}
										activeOpacity={0.7}
									>
								<View style={styles.orderHeader}>
									<View style={styles.orderIconContainer}>
										<Receipt size={24} color={colors["lol-gold"]} />
									</View>
									<View style={styles.orderInfo}>
										<Text style={styles.orderId}>
											ID: {transaction.id?.slice(0, 8) || "N/A"}
										</Text>
										<Text style={styles.orderBuyer}>
											User ID: {transaction.userId.slice(0, 8)}
										</Text>
										<Text style={styles.transactionType}>
											{getTransactionTypeText(transaction.type)}
										</Text>
									</View>
									<View
										style={[
											styles.statusBadge,
											{ backgroundColor: `${getStatusColor(transaction.status)}1A` },
										]}
									>
										<Text
											style={[styles.statusText, { color: getStatusColor(transaction.status) }]}
										>
											{getStatusText(transaction.status, transaction.method)}
										</Text>
									</View>
								</View>
								<View style={styles.orderDetails}>
									{/* Account Info if available */}
									{transaction.accountTitleSnapshot && (
										<View style={styles.itemsContainer}>
											<Text style={styles.itemsLabel}>Tài khoản:</Text>
											<View style={styles.itemRow}>
												<Text style={styles.itemName} numberOfLines={1}>
													• {transaction.accountTitleSnapshot}
												</Text>
											</View>
										</View>
									)}
									<View style={styles.amountRow}>
										<Text style={styles.orderAmountLabel}>Số tiền: </Text>
										<Text style={[styles.orderAmount, { color: getAmountDisplay(transaction).color }]}>
											{getAmountDisplay(transaction).fullText}
										</Text>
									</View>
									<Text style={styles.orderItems}>
										Phương thức: {getMethodText(transaction.method)}
									</Text>
									<Text style={styles.orderDate}>
										Ngày tạo: {formatDate(transaction.createdAt)}
									</Text>
								</View>
								</TouchableOpacity>
								);
							}
						})}
					</>
				)}
			</ScrollView>

			{/* Transaction Detail Sheet */}
			<TransactionDetailSheet
				visible={sheetVisible}
				order={selectedOrder}
				walletTransaction={selectedWalletTransaction}
				buyerName={buyerName}
				isAdmin={userData?.role === "admin"}
				onClose={() => {
					setSheetVisible(false);
					setSelectedOrder(null);
					setSelectedWalletTransaction(null);
				}}
				onUpdate={() => {
					fetchOrders();
				}}
			/>
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
		fontFamily: "Inter_600SemiBold",
		textAlign: "center",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
		paddingBottom: 100,
		gap: 16,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	title: {
		fontSize: 24,
		fontFamily: "Inter_700Bold",
		color: colors["lol-gold"],
	},
	emptyContainer: {
		padding: 32,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyText: {
		color: colors.mutedForeground,
		fontSize: 16,
	},
	orderCard: {
		backgroundColor: `${colors.card}80`,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: `${colors.border}4D`,
		padding: 16,
		gap: 12,
	},
	orderHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	orderIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: `${colors["lol-gold"]}1A`,
		alignItems: "center",
		justifyContent: "center",
	},
	orderInfo: {
		flex: 1,
		gap: 4,
	},
	orderId: {
		fontSize: 16,
		fontFamily: "Inter_700Bold",
		color: colors.foreground,
	},
	orderBuyer: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	statusBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
	},
	statusText: {
		fontSize: 12,
		fontFamily: "Inter_600SemiBold",
	},
	orderDetails: {
		gap: 8,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: `${colors.border}33`,
	},
	amountRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	orderAmountLabel: {
		fontSize: 16,
		fontFamily: "Inter_500Medium",
		color: colors.foreground,
	},
	orderAmount: {
		fontSize: 16,
		fontFamily: "Inter_700Bold",
	},
	orderItems: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	orderDate: {
		fontSize: 12,
		color: colors.mutedForeground,
	},
	transactionType: {
		fontSize: 12,
		color: colors["lol-gold"],
		fontFamily: "Inter_500Medium",
		marginTop: 2,
	},
	orderTypeRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: `${colors.border}40`,
	},
	orderTypeBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
	},
	orderTypeText: {
		fontSize: 14,
		fontFamily: "Inter_600SemiBold",
	},
	orderAmountYellow: {
		fontSize: 18,
		fontFamily: "Inter_700Bold",
		color: "#E4B831", // Yellow/Gold color
	},
	itemsContainer: {
		gap: 4,
		marginBottom: 8,
	},
	itemsLabel: {
		fontSize: 14,
		fontFamily: "Inter_600SemiBold",
		color: colors.foreground,
		marginBottom: 4,
	},
	itemRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	itemName: {
		fontSize: 13,
		color: colors.mutedForeground,
		flex: 1,
	},
	itemRentDuration: {
		fontSize: 12,
		color: colors.accent,
		fontFamily: "Inter_500Medium",
	},
});

