import Background from "@/components/Background";
import OrderCard from "@/components/cart/OrderCard";
import { colors } from "@/libs/colors";
import type { Order } from "@/types/order";
import type { User as UserType } from "@/types/user";
import { router } from "expo-router";
import { ArrowLeft, History, Minus, Plus, Wallet } from "lucide-react-native";
import { useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

// Mock user data
const mockUser: UserType = {
	user_id: 12,
	username: "Nam Nguyen",
	email: "nam@example.com",
	avatar_url: "default_avatar.png",
	phone: "0123456789",
	role: "user",
	balance: 2500000,
	bank_name: "Techcombank",
	bank_account_number: "1234567890",
	bank_account_holder: "NGUYEN VAN NAM",
	created_at: new Date().toISOString(),
	is_active: true,
};

// Mock orders data
const mockOrders: Order[] = [
	{
		order_id: 1,
		user_id: 1,
		account_id: 101,
		account_name: "Tài khoản LOL #1234",
		account_avatar:
			"https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/5367.png",
		rank: "Thách Đấu - 1200LP",
		type: "purchase",
		status: "paid",
		amount: 5000000,
		created_at: "2024-01-15T10:30:00Z",
		updated_at: "2024-01-15T10:35:00Z",
	},
	{
		order_id: 2,
		user_id: 1,
		account_id: 102,
		account_name: "Tài khoản LOL #5678",
		account_avatar:
			"https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/5066.png",
		rank: "Cao Thủ - 450LP",
		type: "rent",
		status: "renting",
		amount: 200000,
		rent_days: 7,
		rent_end_date: "2024-01-22T10:30:00Z",
		created_at: "2024-01-14T15:00:00Z",
		updated_at: "2024-01-14T15:05:00Z",
	},
	{
		order_id: 3,
		user_id: 1,
		account_id: 103,
		account_name: "Tài khoản LOL #9012",
		account_avatar:
			"https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/4648.png",
		rank: "Kim Cương I",
		type: "purchase",
		status: "pending",
		amount: 1500000,
		created_at: "2024-01-16T08:00:00Z",
		updated_at: "2024-01-16T08:00:00Z",
	},
	{
		order_id: 4,
		user_id: 1,
		account_id: 104,
		account_name: "Tài khoản LOL #3456",
		account_avatar:
			"https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/4568.png",
		rank: "Bạch Kim II",
		type: "rent",
		status: "completed",
		amount: 100000,
		rent_days: 3,
		created_at: "2024-01-10T12:00:00Z",
		updated_at: "2024-01-13T12:00:00Z",
	},
	{
		order_id: 5,
		user_id: 1,
		account_id: 105,
		account_name: "Tài khoản LOL #7890",
		account_avatar:
			"https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/5203.png",
		rank: "Kim Cương IV",
		type: "purchase",
		status: "refunded",
		amount: 800000,
		created_at: "2024-01-08T09:00:00Z",
		updated_at: "2024-01-09T14:00:00Z",
	},
	{
		order_id: 6,
		user_id: 1,
		account_id: 106,
		account_name: "Tài khoản LOL #2468",
		account_avatar:
			"https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/4892.png",
		rank: "Vàng I",
		type: "rent",
		status: "cancelled",
		amount: 50000,
		rent_days: 1,
		created_at: "2024-01-05T16:00:00Z",
		updated_at: "2024-01-05T16:30:00Z",
	},
];

export default function Cart() {
	const [activeTab, setActiveTab] = useState<"all" | "purchase" | "rent">("all");

	const purchaseOrders = mockOrders.filter((o) => o.type === "purchase");
	const rentOrders = mockOrders.filter((o) => o.type === "rent");

	const getFilteredOrders = () => {
		switch (activeTab) {
			case "purchase":
				return purchaseOrders;
			case "rent":
				return rentOrders;
			default:
				return mockOrders;
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
							{mockUser.balance.toLocaleString("vi-VN")}
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
								Tất cả ({mockOrders.length})
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
					<View style={styles.ordersList}>
						{getFilteredOrders().map((order) => (
							<OrderCard key={order.order_id} order={order} />
						))}
					</View>
				</View>
			</ScrollView>
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
		fontWeight: "600",
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
		fontWeight: "bold",
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
		fontWeight: "600",
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
		fontWeight: "600",
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
		fontWeight: "600",
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
		fontWeight: "500",
		color: colors.mutedForeground,
	},
	tabTextActive: {
		color: colors.primaryForeground,
		fontWeight: "600",
	},
	ordersList: {
		gap: 12,
	},
});