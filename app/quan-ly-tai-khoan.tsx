import { deleteAccount, getAllAccounts } from "@/actions/account.action";
import { getUserById } from "@/actions/user.action";
import Background from "@/components/Background";
import { colors } from "@/libs/colors";
import type { LolAccount } from "@/types";
import { getApp } from "@react-native-firebase/app";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft, Database, Edit, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Platform,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	ToastAndroid,
	TouchableOpacity,
	View,
} from "react-native";

export default function QuanLyTaiKhoan() {
	const [initializing, setInitializing] = useState(true);
	const [authUser, setAuthUser] = useState<FirebaseAuthTypes.User | null>(null);
	const [userData, setUserData] = useState<any>(null);
	const [accounts, setAccounts] = useState<LolAccount[]>([]);
	const [loading, setLoading] = useState(true);

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
				if (user?.role !== "admin") {
					ToastAndroid.show("Bạn không có quyền truy cập", ToastAndroid.SHORT);
					router.back();
				}
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		}
	}, [authUser]);

	const fetchAccounts = useCallback(async () => {
		try {
			setLoading(true);
			const allAccounts = await getAllAccounts();
			setAccounts(allAccounts);
		} catch (error) {
			console.error("Error fetching accounts:", error);
			ToastAndroid.show("Không thể tải danh sách tài khoản", ToastAndroid.SHORT);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!initializing && authUser?.uid) {
			fetchUserData();
		}
	}, [initializing, authUser, fetchUserData]);

	useFocusEffect(
		useCallback(() => {
			if (authUser?.uid && userData?.role === "admin") {
				fetchAccounts();
			}
		}, [authUser, userData, fetchAccounts])
	);

	const handleEdit = (account: LolAccount) => {
		router.push(`/edit/${account.id}`);
	};

	const handleDelete = (account: LolAccount) => {
		Alert.alert(
			"Xác nhận xóa",
			`Bạn có chắc chắn muốn xóa tài khoản ${account.ingameName || account.title}?`,
			[
				{ text: "Hủy", style: "cancel" },
				{
					text: "Xóa",
					style: "destructive",
					onPress: async () => {
						try {
							if (!account.id) {
								ToastAndroid.show("Không tìm thấy ID tài khoản", ToastAndroid.SHORT);
								return;
							}
							await deleteAccount(account.id);
							ToastAndroid.show("Xóa tài khoản thành công", ToastAndroid.SHORT);
							fetchAccounts();
						} catch (error: any) {
							console.error("Error deleting account:", error);
							ToastAndroid.show(
								error.message || "Không thể xóa tài khoản",
								ToastAndroid.SHORT
							);
						}
					},
				},
			]
		);
	};

	const formatPrice = (price: number) => {
		return price.toLocaleString("vi-VN", {
			style: "currency",
			currency: "VND",
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "available":
				return colors.success || "#10B981";
			case "sold":
				return colors.mutedForeground;
			case "renting":
				return colors.warning || "#F59E0B";
			default:
				return colors.mutedForeground;
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "available":
				return "Có sẵn";
			case "sold":
				return "Đã bán";
			case "renting":
				return "Đang thuê";
			default:
				return status;
		}
	};

	if (initializing || loading) {
		return (
			<View style={[styles.container, styles.centerContent]}>
				<Background />
				<ActivityIndicator size="large" color={colors["lol-gold"]} />
			</View>
		);
	}

	if (!authUser || userData?.role !== "admin") {
		return (
			<View style={[styles.container, styles.centerContent]}>
				<Background />
				<Text style={styles.errorText}>Bạn không có quyền truy cập</Text>
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
					<Text style={styles.title}>Quản lý Tài khoản</Text>
					<View style={{ width: 24 }} />
				</View>

				{/* Accounts List */}
				{accounts.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>Chưa có tài khoản nào</Text>
					</View>
				) : (
					accounts.map((account) => (
						<View key={account.id} style={styles.accountCard}>
							<View style={styles.accountHeader}>
								<View style={styles.accountIconContainer}>
									<Database size={24} color={colors["lol-gold"]} />
								</View>
								<View style={styles.accountInfo}>
									<Text style={styles.accountName}>
										{account.ingameName || account.title || "Unknown"}
									</Text>
									<Text style={styles.accountId}>ID: {account.id?.slice(0, 8) || "N/A"}</Text>
									<Text style={styles.accountSeller}>
										Seller: {account.sellerId?.slice(0, 8) || "N/A"}
									</Text>
								</View>
								<View
									style={[
										styles.statusBadge,
										{ backgroundColor: `${getStatusColor(account.status)}1A` },
									]}
								>
									<Text
										style={[styles.statusText, { color: getStatusColor(account.status) }]}
									>
										{getStatusText(account.status)}
									</Text>
								</View>
							</View>
							<View style={styles.accountDetails}>
								<Text style={styles.accountPrice}>
									Giá mua: {formatPrice(account.buyPrice || 0)}
								</Text>
								{account.rentPricePerHour && account.rentPricePerHour > 0 && (
									<Text style={styles.accountRentPrice}>
										Giá thuê/giờ: {formatPrice(account.rentPricePerHour)}
									</Text>
								)}
								<Text style={styles.accountRank}>
									Rank: {account.soloRank?.tier || account.flexRank?.tier || "Unranked"}
								</Text>
							</View>
							<View style={styles.accountActions}>
								<TouchableOpacity
									style={styles.actionButton}
									onPress={() => handleEdit(account)}
								>
									<Edit size={20} color={colors["lol-gold"]} />
									<Text style={styles.actionButtonText}>Sửa</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[styles.actionButton, styles.deleteButton]}
									onPress={() => handleDelete(account)}
								>
									<Trash2 size={20} color={colors.destructive} />
									<Text style={[styles.actionButtonText, styles.deleteButtonText]}>Xóa</Text>
								</TouchableOpacity>
							</View>
						</View>
					))
				)}
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
	accountCard: {
		backgroundColor: `${colors.card}80`,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: `${colors.border}4D`,
		padding: 16,
		gap: 12,
	},
	accountHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	accountIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: `${colors["lol-gold"]}1A`,
		alignItems: "center",
		justifyContent: "center",
	},
	accountInfo: {
		flex: 1,
		gap: 4,
	},
	accountName: {
		fontSize: 16,
		fontFamily: "Inter_700Bold",
		color: colors.foreground,
	},
	accountId: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	accountSeller: {
		fontSize: 12,
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
	accountDetails: {
		gap: 8,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: `${colors.border}33`,
	},
	accountPrice: {
		fontSize: 16,
		fontFamily: "Inter_700Bold",
		color: colors["lol-gold"],
	},
	accountRentPrice: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	accountRank: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	accountActions: {
		flexDirection: "row",
		gap: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: `${colors.border}33`,
	},
	actionButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		padding: 12,
		borderRadius: 8,
		backgroundColor: `${colors["lol-gold"]}1A`,
		borderWidth: 1,
		borderColor: colors["lol-gold"],
	},
	deleteButton: {
		backgroundColor: `${colors.destructive}1A`,
		borderColor: colors.destructive,
	},
	actionButtonText: {
		color: colors["lol-gold"],
		fontFamily: "Inter_600SemiBold",
	},
	deleteButtonText: {
		color: colors.destructive,
	},
});

