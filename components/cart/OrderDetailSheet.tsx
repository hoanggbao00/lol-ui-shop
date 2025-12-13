import { getAccountCredentials } from "@/actions/account.action";
import { colors } from "@/libs/colors";
import type { Order } from "@/types/order";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

interface OrderDetailSheetProps {
	visible: boolean;
	order: Order | null;
	onClose: () => void;
}

const formatPrice = (price: number) => {
	return price.toLocaleString("vi-VN", {
		style: "currency",
		currency: "VND",
	});
};

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export default function OrderDetailSheet({
	visible,
	order,
	onClose,
}: OrderDetailSheetProps) {
	const [loadingCredentials, setLoadingCredentials] = useState(false);
	const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
	const [showCredentials, setShowCredentials] = useState(false);
	
	// Get status bar height
	const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

	useEffect(() => {
		if (!visible) {
			setCredentials(null);
			setShowCredentials(false);
			setLoadingCredentials(false);
		}
	}, [visible]);

	const handleShowCredentials = async () => {
		if (!order) return;

		if (showCredentials && credentials) {
			setShowCredentials(false);
			return;
		}

		if (order.status !== "paid" && order.status !== "renting") {
			ToastAndroid.show("Chỉ có thể xem thông tin đăng nhập sau khi thanh toán", ToastAndroid.SHORT);
			return;
		}

		try {
			setLoadingCredentials(true);
			// Get Firestore account ID from order
			const accountId = order.account_firestore_id || "";
			
			if (!accountId) {
				ToastAndroid.show("Không tìm thấy thông tin tài khoản", ToastAndroid.SHORT);
				return;
			}

			const credentialsData = await getAccountCredentials(accountId);
			if (credentialsData) {
				setCredentials(credentialsData);
				setShowCredentials(true);
			}
		} catch (error: any) {
			console.error("Error getting credentials:", error);
			ToastAndroid.show(
				error.message || "Không thể lấy thông tin đăng nhập",
				ToastAndroid.SHORT
			);
		} finally {
			setLoadingCredentials(false);
		}
	};

	if (!order) return null;

	const statusConfig: Record<string, { label: string; color: string }> = {
		pending: { label: "Đang chờ", color: "#facc15" },
		paid: { label: "Đã thanh toán", color: "#22c55e" },
		renting: { label: "Đang thuê", color: "#06b6d4" },
		completed: { label: "Hoàn thành", color: "#10b981" },
		refunded: { label: "Hoàn tiền", color: "#f97316" },
		cancelled: { label: "Đã hủy", color: "#ef4444" },
	};

	const status = statusConfig[order.status] || statusConfig.pending;

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<StatusBar barStyle="light-content" />
				<Pressable style={styles.overlayPressable} onPress={onClose} />
				<View style={[styles.sheet, { paddingTop: statusBarHeight }]}>
					{/* Handle */}
					<View style={styles.handle} />

					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.title}>Chi tiết giao dịch</Text>
						<Pressable onPress={onClose}>
							<Ionicons name="close" color="#fff" size={24} />
						</Pressable>
					</View>

					<ScrollView 
						style={styles.content} 
						contentContainerStyle={styles.contentContainer}
						showsVerticalScrollIndicator={false}
					>
						{/* Account Info */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
							<View style={styles.accountCard}>
								<Image
									source={{ uri: order.account_avatar }}
									style={styles.accountAvatar}
									contentFit="cover"
								/>
								<View style={styles.accountInfo}>
									<Text style={styles.accountName}>{order.account_name}</Text>
									<Text style={styles.accountRank}>{order.rank}</Text>
								</View>
							</View>
						</View>

						{/* Order Info */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Thông tin giao dịch</Text>
							<View style={styles.infoCard}>
								<View style={styles.infoRow}>
									<Text style={styles.infoLabel}>Loại:</Text>
									<Text style={styles.infoValue}>
										{order.type === "purchase" ? "Mua" : "Thuê"}
									</Text>
								</View>
								<View style={styles.infoRow}>
									<Text style={styles.infoLabel}>Trạng thái:</Text>
									<View style={[styles.statusBadge, { backgroundColor: `${status.color}33` }]}>
										<Text style={[styles.statusText, { color: status.color }]}>
											{status.label}
										</Text>
									</View>
								</View>
								<View style={styles.infoRow}>
									<Text style={styles.infoLabel}>Số tiền:</Text>
									<Text style={[styles.infoValue, styles.amountText]}>
										{formatPrice(order.amount)}
									</Text>
								</View>
								{order.type === "rent" && order.rent_days && (
									<View style={styles.infoRow}>
										<Text style={styles.infoLabel}>Thời gian thuê:</Text>
										<Text style={styles.infoValue}>{order.rent_days} ngày</Text>
									</View>
								)}
								{order.type === "rent" && order.rent_end_date && (
									<View style={styles.infoRow}>
										<Text style={styles.infoLabel}>Hết hạn:</Text>
										<Text style={styles.infoValue}>
											{formatDate(order.rent_end_date)}
										</Text>
									</View>
								)}
								<View style={styles.infoRow}>
									<Text style={styles.infoLabel}>Ngày tạo:</Text>
									<Text style={styles.infoValue}>{formatDate(order.created_at)}</Text>
								</View>
								{order.updated_at && order.updated_at !== order.created_at && (
									<View style={styles.infoRow}>
										<Text style={styles.infoLabel}>Cập nhật:</Text>
										<Text style={styles.infoValue}>{formatDate(order.updated_at)}</Text>
									</View>
								)}
							</View>
						</View>

						{/* Credentials Section */}
						{(order.status === "paid" || order.status === "renting") && (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>Thông tin đăng nhập</Text>
								{!showCredentials ? (
									<TouchableOpacity
										style={styles.credentialsButton}
										onPress={handleShowCredentials}
										disabled={loadingCredentials}
									>
										{loadingCredentials ? (
											<ActivityIndicator size="small" color={colors["lol-gold"]} />
										) : (
											<>
												<Ionicons name="eye-outline" size={20} color={colors["lol-gold"]} />
												<Text style={styles.credentialsButtonText}>
													Hiển thị thông tin đăng nhập
												</Text>
											</>
										)}
									</TouchableOpacity>
								) : (
									<View style={styles.credentialsCard}>
										<View style={styles.credentialRow}>
											<Text style={styles.credentialLabel}>Tên đăng nhập:</Text>
											<Text style={styles.credentialValue}>
												{credentials?.username || "N/A"}
											</Text>
										</View>
										<View style={styles.credentialRow}>
											<Text style={styles.credentialLabel}>Mật khẩu:</Text>
											<Text style={styles.credentialValue}>
												{credentials?.password || "N/A"}
											</Text>
										</View>
										<TouchableOpacity
											style={styles.hideButton}
											onPress={() => setShowCredentials(false)}
										>
											<Ionicons name="eye-off-outline" size={16} color={colors.mutedForeground} />
											<Text style={styles.hideButtonText}>Ẩn thông tin</Text>
										</TouchableOpacity>
									</View>
								)}
							</View>
						)}
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		justifyContent: "flex-end",
	},
	overlayPressable: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	sheet: {
		backgroundColor: colors.card,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		height: "100%",
		width: "100%",
	},
	content: {
		flex: 1,
	},
	contentContainer: {
		padding: 16,
		paddingBottom: 32,
	},
	handle: {
		width: 40,
		height: 4,
		backgroundColor: colors.mutedForeground,
		borderRadius: 2,
		alignSelf: "center",
		marginTop: 12,
		marginBottom: 8,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: colors.border + "80",
	},
	title: {
		fontSize: 20,
		fontFamily: "Inter_700Bold",
		color: "#fff",
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: "Inter_700Bold",
		color: "#fff",
		marginBottom: 12,
	},
	accountCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		backgroundColor: "#012026",
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors["lol-gold"] + "50",
	},
	accountAvatar: {
		width: 64,
		height: 64,
		borderRadius: 8,
	},
	accountInfo: {
		flex: 1,
	},
	accountName: {
		fontSize: 16,
		fontFamily: "Inter_700Bold",
		color: "#fff",
		marginBottom: 4,
	},
	accountRank: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	infoCard: {
		backgroundColor: "#012026",
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors["lol-gold"] + "50",
		gap: 12,
	},
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	infoLabel: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	infoValue: {
		fontSize: 14,
		color: "#fff",
		fontFamily: "Inter_500Medium",
	},
	amountText: {
		color: colors["lol-gold"],
		fontSize: 16,
		fontFamily: "Inter_700Bold",
	},
	statusBadge: {
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
	},
	statusText: {
		fontSize: 12,
		fontFamily: "Inter_700Bold",
	},
	credentialsButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		backgroundColor: "#012026",
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors["lol-gold"] + "50",
	},
	credentialsButtonText: {
		fontSize: 14,
		fontFamily: "Inter_500Medium",
		color: colors["lol-gold"],
	},
	credentialsCard: {
		backgroundColor: "#012026",
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors["lol-gold"] + "50",
		gap: 16,
	},
	credentialRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	credentialLabel: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	credentialValue: {
		fontSize: 14,
		fontFamily: "Inter_700Bold",
		color: colors["lol-gold"],
		flex: 1,
		textAlign: "right",
	},
	hideButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		marginTop: 8,
	},
	hideButtonText: {
		fontSize: 12,
		color: colors.mutedForeground,
	},
});

