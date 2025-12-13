import { getAccountCredentials } from "@/actions/account.action";
import { createOrder, getOrderById } from "@/actions/order.action";
import { updateUserBalance } from "@/actions/user.action";
import { colors } from "@/libs/colors";
import type { LolAccount } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import { Timestamp, addDoc, collection, getFirestore, serverTimestamp } from "@react-native-firebase/firestore";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	ToastAndroid,
	TouchableOpacity,
	View,
} from "react-native";

interface RentModalProps {
	visible: boolean;
	account: LolAccount | null;
	userBalance: number;
	onClose: () => void;
	onRentSuccess?: () => void;
}

const ADMIN_BANK = {
	bin: "970415",
	account_number: "1234567890",
	account_name: "LOL UI SHOP",
};

const formatPrice = (price: number) => {
	return price.toLocaleString("vi-VN", {
		style: "currency",
		currency: "VND",
	});
};

export default function RentModal({
	visible,
	account,
	userBalance,
	onClose,
	onRentSuccess,
}: RentModalProps) {
	const [selectedHours, setSelectedHours] = useState<number | null>(null);
	const [customHours, setCustomHours] = useState("");
	const [paymentMethod, setPaymentMethod] = useState<"qr" | "balance" | null>(null);
	const [qrUrl, setQrUrl] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
	const [showAccountInfo, setShowAccountInfo] = useState(false);
	const [accountCredentials, setAccountCredentials] = useState<{ username: string; password: string } | null>(null);

	// Reset state when modal closes
	useEffect(() => {
		if (!visible) {
			setSelectedHours(null);
			setCustomHours("");
			setPaymentMethod(null);
			setQrUrl("");
			setIsProcessing(false);
			setPendingOrderId(null);
			setShowAccountInfo(false);
			setAccountCredentials(null);
		}
	}, [visible]);

	const rentalOptions = [
		{ hours: 48, label: "48 giờ (tối thiểu)", price: (account?.rentPricePerHour || 0) * 48 },
		{ hours: 72, label: "72 giờ", price: (account?.rentPricePerHour || 0) * 72 },
	];

	const totalPrice = selectedHours
		? (account?.rentPricePerHour || 0) * selectedHours
		: 0;

	const canPayWithBalance = userBalance >= totalPrice;

	const handleSelectHours = (hours: number) => {
		// Auto-set selectedHours for predefined options (48h, 72h)
		setSelectedHours(hours);
		setCustomHours("");
		setPaymentMethod(null);
		setQrUrl("");
	};

	const handleCustomHours = (value: string) => {
		// Allow empty string or numeric input
		if (value === "") {
			setCustomHours("");
			setSelectedHours(null);
			return;
		}

		// Only allow numeric input
		const numValue = parseInt(value, 10);
		if (!isNaN(numValue) && numValue > 0) {
			setCustomHours(value);
			// Don't auto-set selectedHours, wait for user to click "Thuê" button
			setSelectedHours(null);
		}
	};

	const handleConfirmRentHours = (hours: number) => {
		setSelectedHours(hours);
		setPaymentMethod(null);
		setQrUrl("");
	};

	const generateQR = async () => {
		if (!account || !selectedHours) return;

		try {
			setIsProcessing(true);
			const app = getApp();
			const auth = getAuth(app);
			const currentUser = auth.currentUser;
			
			if (!currentUser) {
				ToastAndroid.show("Vui lòng đăng nhập", ToastAndroid.SHORT);
				return;
			}

			if (!account.id) {
				ToastAndroid.show("Lỗi: Không tìm thấy ID tài khoản", ToastAndroid.SHORT);
				return;
			}

			// Calculate rent end date
			const rentEndDate = new Date();
			rentEndDate.setHours(rentEndDate.getHours() + selectedHours);
			const rentEndTimestamp = Timestamp.fromDate(rentEndDate);

			// Create rent order with status "pending" (chưa thanh toán)
			const orderId = await createOrder({
				buyerId: currentUser.uid,
				totalAmount: totalPrice,
				status: "pending", // Chưa thanh toán
				items: [
					{
						accountId: account.id,
						transactionType: "rent",
						price: totalPrice,
						rentDurationHours: selectedHours,
						rentEndDate: rentEndTimestamp,
						accountTitleSnapshot: account.ingameName || account.title || "Unknown",
					},
				],
			});

			// Create wallet transaction record with status "pending"
			const db = getFirestore(app);
			const transactionsRef = collection(db, "wallet_transactions");
			await addDoc(transactionsRef, {
				userId: currentUser.uid,
				amount: totalPrice,
				type: "withdraw",
				method: "qr_code",
				transactionCode: `RENT_${account.id}_${Date.now()}`,
				status: "pending",
				createdAt: serverTimestamp(),
			});

			// Generate QR code
			const content = `THUEACC ${account.id} ${selectedHours}H ${orderId}`;
			const qrApiUrl = `https://img.vietqr.io/image/${ADMIN_BANK.bin}-${ADMIN_BANK.account_number}-compact2.png?amount=${totalPrice}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(ADMIN_BANK.account_name)}`;
			setQrUrl(qrApiUrl);
			setPendingOrderId(orderId);
			setPaymentMethod("qr");
		} catch (error: any) {
			console.error("Error generating QR:", error);
			ToastAndroid.show(
				error.message || "Có lỗi xảy ra khi tạo QR code",
				ToastAndroid.SHORT
			);
		} finally {
			setIsProcessing(false);
		}
	};

	const handlePayWithBalance = async () => {
		if (!account || !selectedHours) return;

		if (!canPayWithBalance) {
			ToastAndroid.show("Số dư không đủ để thanh toán", ToastAndroid.SHORT);
			return;
		}

		Alert.alert(
			"Xác nhận thanh toán",
			`Bạn có chắc chắn muốn thuê tài khoản này trong ${selectedHours} giờ với giá ${formatPrice(totalPrice)}?`,
			[
				{ text: "Hủy", style: "cancel" },
				{
					text: "Xác nhận",
					onPress: async () => {
						setIsProcessing(true);
						try {
							const app = getApp();
							const auth = getAuth(app);
							const currentUser = auth.currentUser;
							
							if (!currentUser) {
								ToastAndroid.show("Vui lòng đăng nhập", ToastAndroid.SHORT);
								return;
							}

							if (!account.id) {
								ToastAndroid.show("Lỗi: Không tìm thấy ID tài khoản", ToastAndroid.SHORT);
								return;
							}

							// Calculate rent end date
							const rentEndDate = new Date();
							rentEndDate.setHours(rentEndDate.getHours() + selectedHours);
							const rentEndTimestamp = Timestamp.fromDate(rentEndDate);

							// Create rent order (this will also update account status to "renting")
							const orderId = await createOrder({
								buyerId: currentUser.uid,
								totalAmount: totalPrice,
								status: "paid", // Direct payment with balance
								items: [
									{
										accountId: account.id,
										transactionType: "rent",
										price: totalPrice,
										rentDurationHours: selectedHours,
										rentEndDate: rentEndTimestamp,
										accountTitleSnapshot: account.ingameName || account.title || "Unknown",
									},
								],
							});

							// Deduct balance
							await updateUserBalance(currentUser.uid, -totalPrice);

							// Create wallet transaction record for history
							const db = getFirestore(getApp());
							const transactionsRef = collection(db, "wallet_transactions");
							await addDoc(transactionsRef, {
								userId: currentUser.uid,
								amount: totalPrice,
								type: "withdraw",
								method: "balance",
								transactionCode: `RENT_${account.id}_${Date.now()}`,
								status: "completed",
								createdAt: serverTimestamp(),
							});

							// Get account credentials to display
							
							try {
								const credentials = await getAccountCredentials(account.id);
								if (credentials) {
									setAccountCredentials(credentials);
									setShowAccountInfo(true);
								}
							} catch (error: any) {
								console.error("Error getting credentials:", error);
								// Still show success even if credentials fetch fails
							}
							
							ToastAndroid.show("Thuê tài khoản thành công!", ToastAndroid.SHORT);
							onRentSuccess?.();
						} catch (error: any) {
							console.error("Error creating rent order:", error);
							ToastAndroid.show(
								error.message || "Có lỗi xảy ra khi thuê tài khoản",
								ToastAndroid.SHORT
							);
						} finally {
							setIsProcessing(false);
						}
					},
				},
			]
		);
	};

	const handleCheckPayment = async () => {
		if (!pendingOrderId || !account?.id) {
			ToastAndroid.show("Không tìm thấy thông tin đơn hàng", ToastAndroid.SHORT);
			return;
		}

		try {
			setIsProcessing(true);
			
			// Check order status
			const order = await getOrderById(pendingOrderId);
			
			if (!order) {
				ToastAndroid.show("Không tìm thấy đơn hàng", ToastAndroid.SHORT);
				return;
			}

			if (order.status === "paid") {
				// Payment successful - get account credentials
				
				try {
					const credentials = await getAccountCredentials(account.id);
					if (credentials) {
						setAccountCredentials(credentials);
						setShowAccountInfo(true);
						ToastAndroid.show("Thanh toán thành công!", ToastAndroid.SHORT);
						onRentSuccess?.();
					}
				} catch (error: any) {
					ToastAndroid.show(
						error.message || "Không thể lấy thông tin đăng nhập",
						ToastAndroid.SHORT
					);
				}
			} else {
				ToastAndroid.show("Chưa nhận được thanh toán. Vui lòng thử lại sau.", ToastAndroid.SHORT);
			}
		} catch (error: any) {
			console.error("Error checking payment:", error);
			ToastAndroid.show(
				error.message || "Có lỗi xảy ra khi kiểm tra thanh toán",
				ToastAndroid.SHORT
			);
		} finally {
			setIsProcessing(false);
		}
	};

	if (!account) return null;

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<View style={styles.modalContent}>
					<View style={styles.header}>
						<Text style={styles.title}>Thuê tài khoản</Text>
						<View style={styles.headerRight}>
							<Text style={styles.balanceText}>
								Số dư: {formatPrice(userBalance || 0)}
							</Text>
							<Pressable onPress={onClose}>
								<Ionicons name="close" color="#fff" size={24} />
							</Pressable>
						</View>
					</View>

					<View style={styles.accountInfo}>
						<Text style={styles.label}>Tài khoản:</Text>
						<Text style={styles.value}>{account.ingameName || account.title || "Unknown"}</Text>
					</View>

					<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
						{showAccountInfo && accountCredentials && (
							<View style={styles.accountCredentialsContainer}>
								<Text style={styles.sectionTitle}>Thông tin đăng nhập tài khoản</Text>
								<View style={styles.credentialsCard}>
									<View style={styles.credentialRow}>
										<Text style={styles.credentialLabel}>Tên đăng nhập:</Text>
										<Text style={styles.credentialValue}>{accountCredentials.username}</Text>
									</View>
									<View style={styles.credentialRow}>
										<Text style={styles.credentialLabel}>Mật khẩu:</Text>
										<Text style={styles.credentialValue}>{accountCredentials.password}</Text>
									</View>
								</View>
								<TouchableOpacity
									style={styles.closeButton}
									onPress={() => {
										onClose();
									}}
								>
									<Text style={styles.closeButtonText}>Đóng</Text>
								</TouchableOpacity>
							</View>
						)}

						{!showAccountInfo && !selectedHours && (
							<>
								<Text style={styles.sectionTitle}>Chọn thời gian thuê:</Text>
								
								<View style={styles.optionsContainer}>
									{rentalOptions.map((option) => (
										<TouchableOpacity
											key={option.hours}
											style={styles.optionButton}
											onPress={() => handleSelectHours(option.hours)}
										>
											<Ionicons name="time-outline" size={20} color={colors["lol-gold"]} />
											<View style={styles.optionInfo}>
												<Text style={styles.optionLabel}>{option.label}</Text>
												<Text style={styles.optionPrice}>
													{formatPrice(option.price)}
												</Text>
											</View>
										</TouchableOpacity>
									))}
								</View>

								<Text style={styles.customTitle}>Hoặc nhập số giờ tùy chỉnh (tối thiểu 48h):</Text>
								<TextInput
									style={styles.customInput}
									value={customHours}
									onChangeText={handleCustomHours}
									placeholder="Nhập số giờ (≥ 48)"
									placeholderTextColor="#666"
									keyboardType="numeric"
								/>
								{customHours && parseInt(customHours, 10) < 48 && (
									<Text style={styles.errorText}>
										Số giờ tối thiểu là 48 giờ
									</Text>
								)}
								{customHours && parseInt(customHours, 10) >= 48 && (
									<View style={styles.customHoursContainer}>
										<Text style={styles.priceText}>
											Thành tiền: {formatPrice((account.rentPricePerHour || 0) * parseInt(customHours, 10))}
										</Text>
										<TouchableOpacity
											style={styles.confirmRentButton}
											onPress={() => handleConfirmRentHours(parseInt(customHours, 10))}
										>
											<Text style={styles.confirmRentButtonText}>Thuê</Text>
										</TouchableOpacity>
									</View>
								)}
							</>
						)}

						{selectedHours && !paymentMethod && (
							<View style={styles.paymentMethods}>
								<Text style={styles.sectionTitle}>Chọn phương thức thanh toán:</Text>
								
								<TouchableOpacity
									style={styles.paymentButton}
									onPress={generateQR}
								>
									<Ionicons name="qr-code-outline" size={24} color={colors["lol-gold"]} />
									<Text style={styles.paymentButtonText}>Thanh toán bằng QR Code</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[
										styles.paymentButton,
										!canPayWithBalance && styles.paymentButtonDisabled,
									]}
									onPress={handlePayWithBalance}
									disabled={!canPayWithBalance || isProcessing}
								>
									<Ionicons 
										name="wallet-outline" 
										size={24} 
										color={canPayWithBalance ? colors["lol-gold"] : "#666"} 
									/>
									<View style={styles.paymentButtonInfo}>
										<Text style={[
											styles.paymentButtonText,
											!canPayWithBalance && styles.paymentButtonTextDisabled,
										]}>
											Thanh toán bằng số dư
										</Text>
										{!canPayWithBalance && (
											<Text style={styles.insufficientBalanceText}>
												Số dư không đủ (cần {formatPrice(totalPrice)})
											</Text>
										)}
									</View>
								</TouchableOpacity>

								<View style={styles.summaryContainer}>
									<Text style={styles.summaryText}>
										Thời gian: {selectedHours} giờ
									</Text>
									<Text style={styles.summaryText}>
										Giá/giờ: {formatPrice(account.rentPricePerHour || 0)}
									</Text>
									<Text style={styles.summaryTotal}>
										Tổng tiền: {formatPrice(totalPrice)}
									</Text>
								</View>

								<TouchableOpacity
									style={styles.backButton}
									onPress={() => {
										setSelectedHours(null);
										setCustomHours("");
										setPaymentMethod(null);
										setQrUrl("");
									}}
								>
									<Text style={styles.backButtonText}>Quay lại</Text>
								</TouchableOpacity>
							</View>
						)}

						{!showAccountInfo && paymentMethod === "qr" && qrUrl && (
							<ScrollView 
								style={styles.qrContainer}
								contentContainerStyle={styles.qrContainerContent}
								showsVerticalScrollIndicator={false}
							>
								<Text style={styles.sectionTitle}>Quét mã QR để thanh toán</Text>
								
								<View style={styles.qrImageContainer}>
									<Image source={{ uri: qrUrl }} style={styles.qrImage} contentFit="contain" />
								</View>

								<View style={styles.bankInfo}>
									<Text style={styles.infoText}>
										Số tài khoản: <Text style={styles.highlightText}>{ADMIN_BANK.account_number}</Text>
									</Text>
									<Text style={styles.infoText}>
										Ngân hàng: <Text style={styles.highlightText}>Vietcombank</Text>
									</Text>
									<Text style={styles.infoText}>
										Tổng tiền: <Text style={styles.highlightText}>{formatPrice(totalPrice)}</Text>
									</Text>
									<Text style={styles.infoText}>
										Nội dung: <Text style={styles.highlightText}>THUEACC {account.id} {selectedHours}H</Text>
									</Text>
								</View>

								<TouchableOpacity
									style={styles.checkPaymentButton}
									onPress={handleCheckPayment}
								>
									<Text style={styles.checkPaymentButtonText}>
										Kiểm tra thanh toán
									</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={styles.backButton}
									onPress={() => {
										setPaymentMethod(null);
										setQrUrl("");
									}}
								>
									<Text style={styles.backButtonText}>Quay lại</Text>
								</TouchableOpacity>
							</ScrollView>
						)}
					</ScrollView>

					{isProcessing && (
						<View style={styles.processingOverlay}>
							<ActivityIndicator size="large" color={colors["lol-gold"]} />
							<Text style={styles.processingText}>Đang xử lý...</Text>
						</View>
					)}
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
	modalContent: {
		backgroundColor: colors["card"],
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		maxHeight: "90%",
		flex: 1,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: colors["lol-gold"] + "30",
	},
	title: {
		fontSize: 20,
		fontFamily: "Inter_700Bold",
		color: "#fff",
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
	},
	balanceText: {
		color: colors["lol-gold"],
		fontSize: 14,
		fontFamily: "Inter_700Bold",
	},
	accountInfo: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: colors["lol-gold"] + "30",
	},
	label: {
		color: "#999",
		fontSize: 14,
		marginBottom: 4,
	},
	value: {
		color: "#fff",
		fontSize: 16,
		fontFamily: "Inter_600SemiBold",
	},
	scrollView: {
		flex: 1,
		padding: 16,
		paddingBottom: 32,
	},
	sectionTitle: {
		color: "#fff",
		fontSize: 16,
		fontFamily: "Inter_600SemiBold",
		marginBottom: 16,
	},
	optionsContainer: {
		gap: 12,
		marginBottom: 24,
	},
	optionWrapper: {
		gap: 8,
	},
	optionButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		padding: 16,
		backgroundColor: "#012026",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors["lol-gold"] + "50",
	},
	confirmRentButton: {
		backgroundColor: colors["lol-gold"],
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	confirmRentButtonText: {
		color: "#000",
		fontSize: 16,
		fontFamily: "Inter_700Bold",
	},
	customHoursContainer: {
		gap: 12,
		marginTop: 8,
	},
	optionInfo: {
		flex: 1,
	},
	optionLabel: {
		color: "#fff",
		fontSize: 16,
		fontFamily: "Inter_500Medium",
	},
	optionPrice: {
		color: colors["lol-gold"],
		fontSize: 14,
		marginTop: 4,
	},
	customTitle: {
		color: "#fff",
		fontSize: 14,
		marginBottom: 8,
	},
	customInput: {
		backgroundColor: "#012026",
		borderWidth: 1,
		borderColor: colors["lol-gold"] + "50",
		borderRadius: 8,
		padding: 12,
		color: "#fff",
		fontSize: 16,
		marginBottom: 8,
	},
	errorText: {
		color: "#ff4444",
		fontSize: 12,
		marginBottom: 8,
	},
	priceText: {
		color: colors["lol-gold"],
		fontSize: 14,
		fontFamily: "Inter_600SemiBold",
	},
	paymentMethods: {
		gap: 16,
	},
	paymentButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		padding: 16,
		backgroundColor: "#012026",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors["lol-gold"] + "50",
	},
	paymentButtonDisabled: {
		opacity: 0.5,
	},
	paymentButtonInfo: {
		flex: 1,
	},
	paymentButtonText: {
		color: "#fff",
		fontSize: 16,
		fontFamily: "Inter_500Medium",
	},
	paymentButtonTextDisabled: {
		color: "#666",
	},
	insufficientBalanceText: {
		color: "#ff4444",
		fontSize: 12,
		marginTop: 4,
	},
	summaryContainer: {
		backgroundColor: "#012026",
		padding: 16,
		borderRadius: 8,
		marginTop: 16,
		gap: 8,
	},
	summaryText: {
		color: "#fff",
		fontSize: 14,
	},
	summaryTotal: {
		color: colors["lol-gold"],
		fontSize: 18,
		fontFamily: "Inter_700Bold",
		marginTop: 8,
	},
	qrContainer: {
		flex: 1,
	},
	qrContainerContent: {
		gap: 16,
		paddingBottom: 32,
	},
	qrImageContainer: {
		alignItems: "center",
		backgroundColor: "#fff",
		padding: 16,
		borderRadius: 8,
		marginBottom: 16,
	},
	qrImage: {
		width: 200,
		height: 200,
	},
	bankInfo: {
		backgroundColor: "#012026",
		padding: 16,
		borderRadius: 8,
		gap: 8,
		marginBottom: 16,
	},
	infoText: {
		color: "#fff",
		fontSize: 14,
	},
	highlightText: {
		color: colors["lol-gold"],
		fontFamily: "Inter_600SemiBold",
	},
	checkPaymentButton: {
		backgroundColor: colors["lol-gold"],
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
		marginBottom: 16,
	},
	checkPaymentButtonText: {
		color: "#000",
		fontSize: 16,
		fontFamily: "Inter_700Bold",
	},
	backButton: {
		padding: 12,
		alignItems: "center",
	},
	backButtonText: {
		color: colors["lol-gold"],
		fontSize: 14,
	},
	processingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		justifyContent: "center",
		alignItems: "center",
		gap: 16,
	},
	processingText: {
		color: "#fff",
		fontSize: 16,
	},
	accountCredentialsContainer: {
		gap: 16,
		paddingBottom: 32,
	},
	credentialsCard: {
		backgroundColor: "#012026",
		padding: 20,
		borderRadius: 8,
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
		color: "#999",
		fontSize: 14,
		fontFamily: "Inter_500Medium",
	},
	credentialValue: {
		color: colors["lol-gold"],
		fontSize: 16,
		fontFamily: "Inter_700Bold",
		flex: 1,
		textAlign: "right",
	},
	closeButton: {
		backgroundColor: colors["lol-gold"],
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 16,
	},
	closeButtonText: {
		color: "#000",
		fontSize: 16,
		fontFamily: "Inter_700Bold",
	},
});

