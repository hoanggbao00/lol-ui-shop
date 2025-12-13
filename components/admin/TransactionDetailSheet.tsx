import { getAccountById } from "@/actions/account.action";
import { updateOrderStatus } from "@/actions/order.action";
import { getUserById } from "@/actions/user.action";
import { ADMIN_BANK } from "@/libs/admin-bank";
import { colors } from "@/libs/colors";
import type { LolAccount, Order, WalletTransaction } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getApp } from "@react-native-firebase/app";
import { doc, getFirestore, serverTimestamp, updateDoc } from "@react-native-firebase/firestore";
import { Image } from "expo-image";
import { router } from "expo-router";
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
  View
} from "react-native";

interface TransactionDetailSheetProps {
	visible: boolean;
	order: Order | null;
	walletTransaction: WalletTransaction | null;
	buyerName?: string;
	isAdmin?: boolean;
	onClose: () => void;
	onUpdate?: () => void;
}

const formatPrice = (price: number) => {
	return price.toLocaleString("vi-VN", {
		style: "currency",
		currency: "VND",
	});
};

const formatDate = (timestamp: any) => {
	if (!timestamp) return "N/A";
	const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
	return date.toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const getTransactionType = (order: Order | null, walletTransaction: WalletTransaction | null): string => {
	if (walletTransaction) {
		if (walletTransaction.type === "deposit") {
			return "Nạp balance";
		} else if (walletTransaction.type === "withdraw") {
			return "Rút balance";
		}
	}
	
	if (order) {
		const hasPurchase = order.items?.some(item => item.transactionType === "purchase");
		const hasRent = order.items?.some(item => item.transactionType === "rent");
		
		if (hasPurchase && hasRent) {
			return "Mua và Thuê tài khoản";
		} else if (hasPurchase) {
			return "Mua tài khoản";
		} else if (hasRent) {
			return "Thuê tài khoản";
		}
	}
	
	return "Không xác định";
};

const getStatusColor = (status: string) => {
	switch (status) {
		case "paid":
		case "completed":
			return "#10B981";
		case "pending":
			return "#F59E0B";
		case "cancelled":
			return colors.destructive;
		default:
			return colors.mutedForeground;
	}
};

const getStatusText = (status: string) => {
	switch (status) {
		case "paid":
			return "Đã thanh toán";
		case "pending":
			return "Chờ thanh toán";
		case "completed":
			return "Hoàn thành";
		case "cancelled":
			return "Đã hủy";
		default:
			return status;
	}
};

export default function TransactionDetailSheet({
	visible,
	order,
	walletTransaction,
	buyerName,
	isAdmin = false,
	onClose,
	onUpdate,
}: TransactionDetailSheetProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editStatus, setEditStatus] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [accountDetails, setAccountDetails] = useState<LolAccount | null>(null);
	const [sellerName, setSellerName] = useState<string>("");
	const [loadingAccount, setLoadingAccount] = useState(false);
	const [userBankInfo, setUserBankInfo] = useState<{
		bankName?: string;
		bankAccountNumber?: string;
		bankAccountHolder?: string;
	} | null>(null);
	const [qrUrl, setQrUrl] = useState<string>("");
	
	// Get status bar height
	const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

	useEffect(() => {
		if (visible) {
			if (order) {
				setEditStatus(order.status);
			} else if (walletTransaction) {
				setEditStatus(walletTransaction.status);
			}
			setIsEditing(false);
			setQrUrl("");
			setUserBankInfo(null);
			
			// Load account details if order has items
			if (order && order.items && order.items.length > 0) {
				loadAccountDetails(order.items[0].accountId);
			} else {
				setAccountDetails(null);
				setSellerName("");
			}
			
			// Load user bank info for withdraw transactions
			if (walletTransaction && walletTransaction.type === "withdraw") {
				loadUserBankInfo(walletTransaction.userId);
			}
		}
	}, [visible, order, walletTransaction]);

	const loadAccountDetails = async (accountId: string) => {
		try {
			setLoadingAccount(true);
			const account = await getAccountById(accountId);
			if (account) {
				setAccountDetails(account);
				// Get seller name
				if (account.sellerId) {
					const seller = await getUserById(account.sellerId);
					setSellerName(seller?.username || seller?.email || "Unknown");
				}
			}
		} catch (error) {
			console.error("Error loading account details:", error);
		} finally {
			setLoadingAccount(false);
		}
	};

	const loadUserBankInfo = async (userId: string) => {
		try {
			const user = await getUserById(userId);
			if (user) {
				setUserBankInfo({
					bankName: user.bankName,
					bankAccountNumber: user.bankAccountNumber,
					bankAccountHolder: user.bankAccountHolder,
				});
				
				// Generate QR code for withdraw if user has bank info
				if (walletTransaction && user.bankAccountNumber && walletTransaction.amount > 0) {
					const amount = walletTransaction.amount;
					const content = `RUTTIEN ${userId} ${walletTransaction.id || Date.now()}`;
					const qrApiUrl = `https://img.vietqr.io/image/${ADMIN_BANK.bin}-${ADMIN_BANK.account_number}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(ADMIN_BANK.account_name)}`;
					setQrUrl(qrApiUrl);
				}
			}
		} catch (error) {
			console.error("Error loading user bank info:", error);
		}
	};

	const handleSave = async () => {
		if (!order && !walletTransaction) return;

		try {
			setIsSaving(true);
			
			if (order && order.id) {
				// Update order status
				await updateOrderStatus(order.id, editStatus as any);
				ToastAndroid.show("Cập nhật thành công", ToastAndroid.SHORT);
			} else if (walletTransaction && walletTransaction.id) {
				// Update wallet transaction status
				const app = getApp();
				const db = getFirestore(app);
				const transRef = doc(db, "wallet_transactions", walletTransaction.id);
				await updateDoc(transRef, {
					status: editStatus,
					updatedAt: serverTimestamp(),
				});
				ToastAndroid.show("Cập nhật thành công", ToastAndroid.SHORT);
			}
			
			setIsEditing(false);
			onUpdate?.();
		} catch (error: any) {
			console.error("Error updating transaction:", error);
			ToastAndroid.show(
				error.message || "Không thể cập nhật giao dịch",
				ToastAndroid.SHORT
			);
		} finally {
			setIsSaving(false);
		}
	};

	const transactionType = getTransactionType(order, walletTransaction);
	const currentStatus = order?.status || walletTransaction?.status || "";
	const statusColor = getStatusColor(currentStatus);
	const statusText = getStatusText(currentStatus);

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
						{/* Transaction Type */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Loại giao dịch</Text>
							<Text style={styles.sectionValue}>{transactionType}</Text>
						</View>

						{/* Buyer/User Info */}
						{buyerName && (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>Người tạo</Text>
								<Text style={styles.sectionValue}>{buyerName}</Text>
							</View>
						)}

						{/* Order Info */}
						{order && (
							<>
								<View style={styles.section}>
									<Text style={styles.sectionTitle}>Order ID</Text>
									<Text style={styles.sectionValue}>{order.id || "N/A"}</Text>
								</View>
								{buyerName && (
									<View style={styles.section}>
										<Text style={styles.sectionTitle}>Người mua</Text>
										<Text style={styles.sectionValue}>{buyerName}</Text>
									</View>
								)}
								{accountDetails && (
									<>
										<View style={styles.section}>
											<Text style={styles.sectionTitle}>Tên tài khoản</Text>
											<Text style={styles.sectionValue}>
												{accountDetails.ingameName || accountDetails.title || "Unknown"}
											</Text>
										</View>
										{sellerName && (
											<View style={styles.section}>
												<Text style={styles.sectionTitle}>Người đăng bán</Text>
												<Text style={styles.sectionValue}>{sellerName}</Text>
											</View>
										)}
										{accountDetails.id && (
											<TouchableOpacity
												style={styles.viewAccountButton}
												onPress={() => {
													onClose();
													router.push(`/detail-acc/${accountDetails.id}`);
												}}
											>
												<Ionicons name="eye" size={20} color={colors["lol-gold"]} />
												<Text style={styles.viewAccountButtonText}>
													Xem chi tiết tài khoản
												</Text>
											</TouchableOpacity>
										)}
									</>
								)}
								{loadingAccount && (
									<View style={styles.loadingContainer}>
										<ActivityIndicator size="small" color={colors["lol-gold"]} />
										<Text style={styles.loadingText}>Đang tải thông tin tài khoản...</Text>
									</View>
								)}
								<View style={styles.section}>
									<Text style={styles.sectionTitle}>Tổng tiền</Text>
									<Text style={[styles.sectionValue, styles.priceValue]}>
										{formatPrice(order.totalAmount)}
									</Text>
								</View>
								{order.items && order.items.length > 0 && (
									<View style={styles.section}>
										<Text style={styles.sectionTitle}>Số lượng items</Text>
										<Text style={styles.sectionValue}>{order.items.length}</Text>
										{order.items.map((item, index) => (
											<View key={index} style={styles.itemCard}>
												<Text style={styles.itemText}>
													• {item.transactionType === "purchase" ? "Mua" : "Thuê"}: {formatPrice(item.price)}
												</Text>
												{item.rentDurationHours && (
													<Text style={styles.itemSubText}>
														Thời gian: {item.rentDurationHours} giờ
													</Text>
												)}
											</View>
										))}
									</View>
								)}
							</>
						)}

						{/* Wallet Transaction Info */}
						{walletTransaction && (
							<>
								<View style={styles.section}>
									<Text style={styles.sectionTitle}>Transaction ID</Text>
									<Text style={styles.sectionValue}>{walletTransaction.id || "N/A"}</Text>
								</View>
								<View style={styles.section}>
									<Text style={styles.sectionTitle}>User ID</Text>
									<Text style={styles.sectionValue}>{walletTransaction.userId}</Text>
								</View>
								<View style={styles.section}>
									<Text style={styles.sectionTitle}>Số tiền</Text>
									<Text style={[styles.sectionValue, styles.priceValue]}>
										{formatPrice(walletTransaction.amount)}
									</Text>
								</View>
								<View style={styles.section}>
									<Text style={styles.sectionTitle}>Phương thức</Text>
									<Text style={styles.sectionValue}>{walletTransaction.method}</Text>
								</View>
								{walletTransaction.transactionCode && (
									<View style={styles.section}>
										<Text style={styles.sectionTitle}>Mã giao dịch</Text>
										<Text style={styles.sectionValue}>{walletTransaction.transactionCode}</Text>
									</View>
								)}
								{walletTransaction.adminNote && (
									<View style={styles.section}>
										<Text style={styles.sectionTitle}>Ghi chú admin</Text>
										<Text style={styles.sectionValue}>{walletTransaction.adminNote}</Text>
									</View>
								)}
								
								{/* Bank Info for Withdraw Transactions */}
								{walletTransaction.type === "withdraw" && userBankInfo && (
									<View style={styles.section}>
										<Text style={styles.sectionTitle}>Thông tin ngân hàng nhận tiền</Text>
										{userBankInfo.bankName && (
											<View style={styles.bankInfoRow}>
												<Text style={styles.bankInfoLabel}>Ngân hàng:</Text>
												<Text style={styles.bankInfoValue}>{userBankInfo.bankName}</Text>
											</View>
										)}
										{userBankInfo.bankAccountNumber && (
											<View style={styles.bankInfoRow}>
												<Text style={styles.bankInfoLabel}>Số tài khoản:</Text>
												<Text style={styles.bankInfoValue}>{userBankInfo.bankAccountNumber}</Text>
											</View>
										)}
										{userBankInfo.bankAccountHolder && (
											<View style={styles.bankInfoRow}>
												<Text style={styles.bankInfoLabel}>Chủ tài khoản:</Text>
												<Text style={styles.bankInfoValue}>{userBankInfo.bankAccountHolder}</Text>
											</View>
										)}
									</View>
								)}
								
								{/* QR Code for Withdraw Transactions (Admin view) */}
								{walletTransaction.type === "withdraw" && qrUrl && isAdmin && (
									<View style={styles.section}>
										<Text style={styles.sectionTitle}>QR Code chuyển khoản</Text>
										<ScrollView style={styles.qrScrollView}>
											<View style={styles.qrContainer}>
												<View style={styles.qrImageWrapper}>
													<Image
														source={{ uri: qrUrl }}
														style={styles.qrImage}
														contentFit="contain"
													/>
												</View>
												<View style={styles.bankInfo}>
													<View style={styles.bankInfoRow}>
														<Text style={styles.bankInfoLabel}>Ngân hàng:</Text>
														<Text style={styles.bankInfoValue}>{ADMIN_BANK.name}</Text>
													</View>
													<View style={styles.bankInfoRow}>
														<Text style={styles.bankInfoLabel}>Số TK:</Text>
														<Text style={styles.bankInfoValue}>{ADMIN_BANK.account_number}</Text>
													</View>
													<View style={styles.bankInfoRow}>
														<Text style={styles.bankInfoLabel}>Chủ TK:</Text>
														<Text style={styles.bankInfoValue}>{ADMIN_BANK.account_name}</Text>
													</View>
													{walletTransaction.transactionCode && (
														<View style={styles.bankInfoRow}>
															<Text style={styles.bankInfoLabel}>Nội dung:</Text>
															<Text style={[styles.bankInfoValue, { color: colors.primary }]}>
																{walletTransaction.transactionCode}
															</Text>
														</View>
													)}
												</View>
											</View>
										</ScrollView>
									</View>
								)}
							</>
						)}

						{/* Status */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Trạng thái</Text>
							{isEditing ? (
								<View style={styles.editStatusContainer}>
									<View style={styles.statusSelect}>
										{["paid", "pending", "cancelled", "completed"].map((status) => (
											<TouchableOpacity
												key={status}
												style={[
													styles.statusOption,
													editStatus === status && styles.statusOptionSelected,
												]}
												onPress={() => setEditStatus(status)}
											>
												<Text
													style={[
														styles.statusOptionText,
														editStatus === status && styles.statusOptionTextSelected,
													]}
												>
													{getStatusText(status)}
												</Text>
											</TouchableOpacity>
										))}
									</View>
									<View style={styles.editButtons}>
										<TouchableOpacity
											style={[styles.button, styles.cancelButton]}
											onPress={() => {
												setIsEditing(false);
												setEditStatus(currentStatus);
											}}
										>
											<Text style={styles.cancelButtonText}>Hủy</Text>
										</TouchableOpacity>
										<TouchableOpacity
											style={[styles.button, styles.saveButton]}
											onPress={handleSave}
											disabled={isSaving}
										>
											{isSaving ? (
												<ActivityIndicator size="small" color="#000" />
											) : (
												<Text style={styles.saveButtonText}>Lưu</Text>
											)}
										</TouchableOpacity>
									</View>
								</View>
							) : (
								<View style={styles.statusContainer}>
									<View
										style={[
											styles.statusBadge,
											{ backgroundColor: `${statusColor}1A` },
										]}
									>
										<Text style={[styles.statusText, { color: statusColor }]}>
											{statusText}
										</Text>
									</View>
									{isAdmin && (
										<TouchableOpacity
											style={styles.editButton}
											onPress={() => setIsEditing(true)}
										>
											<Ionicons name="pencil" size={20} color={colors["lol-gold"]} />
											<Text style={styles.editButtonText}>Chỉnh sửa</Text>
										</TouchableOpacity>
									)}
								</View>
							)}
						</View>

						{/* Dates */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Ngày tạo</Text>
							<Text style={styles.sectionValue}>
								{formatDate(order?.createdAt || walletTransaction?.createdAt)}
							</Text>
						</View>
						{(order?.updatedAt || walletTransaction?.updatedAt) && (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>Ngày cập nhật</Text>
								<Text style={styles.sectionValue}>
									{formatDate(order?.updatedAt || walletTransaction?.updatedAt)}
								</Text>
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
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	overlayPressable: {
		flex: 1,
	},
	sheet: {
		height: "100%",
		backgroundColor: colors["lol-black"],
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		overflow: "hidden",
	},
	handle: {
		width: 40,
		height: 4,
		backgroundColor: colors.mutedForeground,
		borderRadius: 2,
		alignSelf: "center",
		marginTop: 8,
		marginBottom: 16,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: `${colors.border}33`,
	},
	title: {
		fontSize: 20,
		fontFamily: "Inter_700Bold",
		color: "#fff",
	},
	content: {
		flex: 1,
	},
	contentContainer: {
		padding: 20,
		paddingBottom: 100,
		gap: 20,
	},
	section: {
		gap: 8,
	},
	sectionTitle: {
		fontSize: 14,
		fontFamily: "Inter_600SemiBold",
		color: colors.mutedForeground,
	},
	sectionValue: {
		fontSize: 16,
		fontFamily: "Inter_500Medium",
		color: "#fff",
	},
	priceValue: {
		fontSize: 20,
		fontFamily: "Inter_700Bold",
		color: colors["lol-gold"],
	},
	itemCard: {
		backgroundColor: `${colors.card}40`,
		borderRadius: 8,
		padding: 12,
		marginTop: 8,
	},
	itemText: {
		fontSize: 14,
		fontFamily: "Inter_500Medium",
		color: "#fff",
	},
	itemSubText: {
		fontSize: 12,
		color: colors.mutedForeground,
		marginTop: 4,
	},
	statusContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	statusBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
	},
	statusText: {
		fontSize: 14,
		fontFamily: "Inter_600SemiBold",
	},
	editButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		padding: 8,
	},
	editButtonText: {
		fontSize: 14,
		fontFamily: "Inter_500Medium",
		color: colors["lol-gold"],
	},
	editStatusContainer: {
		gap: 12,
	},
	statusSelect: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	statusOption: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: `${colors.border}4D`,
		backgroundColor: `${colors.card}40`,
	},
	statusOptionSelected: {
		backgroundColor: `${colors["lol-gold"]}1A`,
		borderColor: colors["lol-gold"],
	},
	statusOptionText: {
		fontSize: 14,
		fontFamily: "Inter_500Medium",
		color: colors.mutedForeground,
	},
	statusOptionTextSelected: {
		color: colors["lol-gold"],
	},
	editButtons: {
		flexDirection: "row",
		gap: 12,
		marginTop: 8,
	},
	button: {
		flex: 1,
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	cancelButton: {
		backgroundColor: `${colors.destructive}1A`,
		borderWidth: 1,
		borderColor: colors.destructive,
	},
	cancelButtonText: {
		color: colors.destructive,
		fontFamily: "Inter_600SemiBold",
	},
	saveButton: {
		backgroundColor: colors["lol-gold"],
	},
	saveButtonText: {
		color: "#000",
		fontFamily: "Inter_600SemiBold",
	},
	viewAccountButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		padding: 12,
		backgroundColor: `${colors["lol-gold"]}1A`,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors["lol-gold"],
		marginTop: 8,
	},
	viewAccountButtonText: {
		fontSize: 14,
		fontFamily: "Inter_600SemiBold",
		color: colors["lol-gold"],
	},
	loadingContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		padding: 12,
	},
	loadingText: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	qrScrollView: {
		maxHeight: 400,
	},
	qrContainer: {
		gap: 12,
		alignItems: "center",
	},
	qrImageWrapper: {
		padding: 16,
		backgroundColor: colors.background,
		borderRadius: 12,
	},
	qrImage: {
		width: 250,
		height: 250,
	},
	bankInfo: {
		width: "100%",
		gap: 8,
	},
	bankInfoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 4,
	},
	bankInfoLabel: {
		fontSize: 14,
		color: colors.mutedForeground,
		fontFamily: "Inter_500Medium",
	},
	bankInfoValue: {
		fontSize: 14,
		fontFamily: "Inter_600SemiBold",
		color: colors.foreground,
	},
});

