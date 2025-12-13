import { getAccountById } from "@/actions/account.action";
import { reclaimAccount } from "@/actions/order.action";
import { getUserById } from "@/actions/user.action";
import Background from "@/components/Background";
import RankCard from "@/components/detail-account/RankCard";
import StatBadge from "@/components/detail-account/StatBadge";
import { ADMIN_BANK } from "@/libs/admin-bank";
import { colors } from "@/libs/colors";
import { getRanksArray } from '@/libs/get-ranks-array';
import type { LolAccount } from "@/types";
import type { AccountDetail } from "@/types/account";
import { getApp } from "@react-native-firebase/app";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
	ArrowLeft,
	Clock,
	Crown,
	Gem,
	ShoppingCart,
	Star,
	Swords,
	Trophy,
	Users
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	ToastAndroid,
	TouchableOpacity,
	View
} from "react-native";

// Helper function to convert LolAccount to AccountDetail
const mapLolAccountToAccountDetail = (account: LolAccount): AccountDetail => {
	return {
		id: account.id || "",
		username: account.ingameName || account.title || "Unknown",
		title: account.title,
		level: account.level || 0,
		avatarUrl: account.thumbnailUrl || "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/5367.png",
		server: account.server,
		champions: account.champCount || 0,
		skins: account.skinCount || 0,
		blueEssence: account.blueEssence || 0,
		orangeEssence: account.orangeEssence || 0,
		rp: account.rp,
		honorLevel: account.honorLevel || 0,
		masteryPoints: account.masteryPoints || 0,
		region: account.region || "",
		// Map ranks by type (solo, flex, tft)
		soloRank: account.soloRank?.tier,
		soloDivision: account.soloRank?.division,
		soloLP: account.soloRank?.lp,
		soloWins: account.soloRank?.wins,
		flexRank: account.flexRank?.tier,
		flexDivision: account.flexRank?.division,
		flexLP: account.flexRank?.lp,
		flexWins: account.flexRank?.wins,
		tftRank: account.tftRank?.tier,
		tftDivision: account.tftRank?.division,
		tftLP: account.tftRank?.lp,
		tftWins: account.tftRank?.wins,
		price: account.buyPrice || 0,
		rentPricePerHour: account.rentPricePerHour || 0,
		description: account.description || "",
	};
};

const formatPrice = (price: number) => {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
	}).format(price);
};

// Mock user ID for QR generation
const MOCK_USER_ID = 12;

// Rental duration options (in hours)
const getRentalOptions = (rentPricePerHour: number) => {
	const basePrice = rentPricePerHour || 1000;
	return [
		{ hours: 48, label: "48 giờ", price: basePrice * 48 },
		{ hours: 72, label: "72 giờ", price: basePrice * 72 },
		{ hours: 120, label: "5 ngày", price: basePrice * 120 },
		{ hours: 168, label: "7 ngày", price: basePrice * 168 },
	];
};

export default function DetailAcc() {
	const { id } = useLocalSearchParams();
	const [account, setAccount] = useState<LolAccount | null>(null);
	const [accountDetail, setAccountDetail] = useState<AccountDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [buyModalOpen, setBuyModalOpen] = useState(false);
	const [rentModalOpen, setRentModalOpen] = useState(false);
	const [qrUrl, setQrUrl] = useState("");
	const [selectedRental, setSelectedRental] = useState<number | null>(null);
	const [authUser, setAuthUser] = useState<FirebaseAuthTypes.User | null>(null);
	const [userData, setUserData] = useState<any>(null);
	const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
	const [reclaiming, setReclaiming] = useState(false);

	const fetchAccount = useCallback(async () => {
		if (!id || typeof id !== "string") {
			setError("ID tài khoản không hợp lệ");
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);
			const accountData = await getAccountById(id);
			if (!accountData) {
				setError("Không tìm thấy tài khoản");
				return;
			}
			setAccount(accountData);
			const mappedDetail = mapLolAccountToAccountDetail(accountData);
			setAccountDetail(mappedDetail);

			// Check if user is owner or admin
			if (authUser?.uid) {
				const user = await getUserById(authUser.uid);
				setUserData(user);
				const isOwner = accountData.sellerId === authUser.uid;
				const isAdmin = user?.role === "admin";
				setIsOwnerOrAdmin(isOwner || isAdmin);
			}
		} catch (err: any) {
			console.error("Error fetching account:", err);
			setError(err.message || "Không thể tải thông tin tài khoản");
		} finally {
			setLoading(false);
		}
	}, [id, authUser]);

	useEffect(() => {
		const app = getApp();
		const auth = getAuth(app);
		const subscriber = onAuthStateChanged(auth, (user) => {
			setAuthUser(user);
		});
		return subscriber;
	}, []);

	useEffect(() => {
		if (authUser) {
			fetchAccount();
		}
	}, [fetchAccount, authUser]);

	useFocusEffect(
		useCallback(() => {
			if (authUser) {
				fetchAccount();
			}
		}, [fetchAccount, authUser])
	);

	const handleBuy = () => {
		setBuyModalOpen(true);
		generateQRForBuy();
	};

	const handleRent = () => {
		setRentModalOpen(true);
		setSelectedRental(null);
		setQrUrl("");
	};

	const generateQRForBuy = () => {
		if (!account || !account.id) return;
		const amount = account.buyPrice || 0;
		const content = `MUAACC ${account.id} ${account.sellerId}`;
		const qrApiUrl = `https://img.vietqr.io/image/${ADMIN_BANK.bin}-${ADMIN_BANK.account_number}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(ADMIN_BANK.account_name)}`;
		setQrUrl(qrApiUrl);
	};

	const generateQRForRent = (hours: number, price: number) => {
		if (!account || !account.id) return;
		const content = `THUEACC ${account.id} ${hours}H ${account.sellerId}`;
		const qrApiUrl = `https://img.vietqr.io/image/${ADMIN_BANK.bin}-${ADMIN_BANK.account_number}-compact2.png?amount=${price}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(ADMIN_BANK.account_name)}`;
		setQrUrl(qrApiUrl);
		setSelectedRental(hours);
	};

	const closeBuyModal = () => {
		setBuyModalOpen(false);
		setQrUrl("");
	};

	const closeRentModal = () => {
		setRentModalOpen(false);
		setQrUrl("");
		setSelectedRental(null);
	};

	const handleCheckPayment = () => {
		ToastAndroid.show(
			"Đang kiểm tra thanh toán...",
			ToastAndroid.SHORT
		);
		// TODO: Implement payment verification
	};

	const handleReclaim = () => {
		if (!account || account.status !== "renting") {
			ToastAndroid.show("Tài khoản không đang được thuê", ToastAndroid.SHORT);
			return;
		}

		Alert.alert(
			"Xác nhận thu hồi",
			"Bạn có chắc chắn muốn thu hồi tài khoản này? Tiền sẽ được hoàn lại cho người thuê và trừ tiền của bạn.",
			[
				{
					text: "Hủy",
					style: "cancel",
				},
				{
					text: "Xác nhận",
					style: "destructive",
					onPress: async () => {
						if (!account?.id) return;
						try {
							setReclaiming(true);
							await reclaimAccount(account.id);
							ToastAndroid.show("Thu hồi tài khoản thành công", ToastAndroid.LONG);
							// Refresh account data
							await fetchAccount();
						} catch (err: any) {
							console.error("Error reclaiming account:", err);
							ToastAndroid.show(
								err.message || "Không thể thu hồi tài khoản",
								ToastAndroid.LONG
							);
						} finally {
							setReclaiming(false);
						}
					},
				},
			]
		);
	};

	if (loading) {
		return (
			<View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
				<Background />
				<ActivityIndicator size="large" color={colors["lol-gold"]} />
				<Text style={{ color: colors.mutedForeground, marginTop: 16 }}>
					Đang tải thông tin tài khoản...
				</Text>
			</View>
		);
	}

	if (error || !account || !accountDetail) {
		return (
			<View style={[styles.container, { justifyContent: "center", alignItems: "center", padding: 32 }]}>
				<Background />
				<Text style={{ color: colors.destructive, fontSize: 16, textAlign: "center" }}>
					{error || "Không tìm thấy tài khoản"}
				</Text>
				<TouchableOpacity
					onPress={() => router.back()}
					style={{ marginTop: 16, padding: 12, backgroundColor: colors["lol-gold"], borderRadius: 8 }}
				>
					<Text style={{ color: "#000", fontFamily: "Inter_600SemiBold" }}>Quay lại</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Background />

			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}
				>
					<ArrowLeft size={24} color={colors.foreground} />
				</TouchableOpacity>
				<Text style={styles.title}>Chi tiết tài khoản</Text>
				<View style={{ width: 24 }} />
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Profile Header */}
				<View style={styles.profileHeader}>
					<View style={styles.profileGlow} />

					<View style={styles.profileContent}>
						{/* Avatar */}
						<View style={styles.avatarContainer}>
							<View style={styles.avatarWrapper}>
								<Image
									source={{ uri: accountDetail.avatarUrl }}
									style={styles.avatar}
									contentFit="cover"
								/>
							</View>
							{/* Level Badge */}
							{accountDetail.level > 0 && (
								<View style={styles.levelBadge}>
									<Text style={styles.levelText}>{accountDetail.level}</Text>
								</View>
							)}
						</View>

						{/* Info */}
						<View style={styles.profileInfo}>
							<View style={styles.profileNameRow}>
								<Text style={styles.profileName}>{accountDetail.username}</Text>
								{accountDetail.server && (
									<View style={styles.serverBadge}>
										<Text style={styles.serverText}>{accountDetail.server}</Text>
									</View>
								)}
							</View>
							{accountDetail.title && (
								<Text style={styles.profileTitle}>{accountDetail.title}</Text>
							)}
							{accountDetail.description && (
								<Text style={styles.profileDescription}>
									{accountDetail.description}
								</Text>
							)}
						</View>
					</View>
				</View>

				{/* Ranks Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Crown size={16} color={colors["lol-gold"]} />
						<Text style={styles.sectionTitle}>Xếp hạng</Text>
					</View>
					{getRanksArray(accountDetail).length > 0 ? (
						<View style={styles.ranksGrid}>
							{getRanksArray(accountDetail).map((rank, index) => (
								<RankCard key={index.toString()} rank={rank} />
							))}
						</View>
					) : (
						<View style={styles.emptyRanksContainer}>
							<Text style={styles.emptyRanksText}>Không có rank</Text>
						</View>
					)}
				</View>

				{/* Stats Grid */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Trophy size={16} color={colors["lol-gold"]} />
						<Text style={styles.sectionTitle}>Thống kê</Text>
					</View>
					<View style={styles.statsGrid}>
						{accountDetail.honorLevel !== undefined && accountDetail.honorLevel !== null && (
							<StatBadge
								label="Vinh danh"
								value={`Cấp ${accountDetail.honorLevel}`}
								icon={<Star size={24} color={colors.primary} />}
							/>
						)}
						{accountDetail.masteryPoints !== undefined && accountDetail.masteryPoints !== null && (
							<StatBadge
								label="Điểm thông thạo"
								value={accountDetail.masteryPoints.toLocaleString()}
								icon={<Swords size={24} color={colors.primary} />}
							/>
						)}
						{accountDetail.region && (
							<StatBadge
								label="Cờ hiệu"
								value={accountDetail.region}
								icon={<Users size={24} color={colors.primary} />}
							/>
						)}
					</View>
				</View>

				{/* Assets Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Gem size={16} color={colors["lol-gold"]} />
						<Text style={styles.sectionTitle}>Tài sản</Text>
					</View>
					<View style={styles.assetsGrid}>
						{accountDetail.champions !== undefined && accountDetail.champions !== null && (
							<View style={styles.assetItem}>
								<Text style={styles.assetLabel}>Tướng</Text>
								<Text style={styles.assetValue}>{accountDetail.champions}</Text>
							</View>
						)}
						{accountDetail.skins !== undefined && accountDetail.skins !== null && (
							<View style={styles.assetItem}>
								<Text style={styles.assetLabel}>Skin</Text>
								<Text style={styles.assetValue}>{accountDetail.skins}</Text>
							</View>
						)}
						{accountDetail.blueEssence !== undefined && accountDetail.blueEssence !== null && (
							<View style={styles.assetItem}>
								<Text style={styles.assetLabel}>Tinh hoa xanh</Text>
								<Text style={[styles.assetValue, { color: colors.primary }]}>
									{accountDetail.blueEssence.toLocaleString()}
								</Text>
							</View>
						)}
						{accountDetail.orangeEssence !== undefined && accountDetail.orangeEssence !== null && (
							<View style={styles.assetItem}>
								<Text style={styles.assetLabel}>Tinh hoa cam</Text>
								<Text style={[styles.assetValue, { color: colors["lol-gold"] }]}>
									{accountDetail.orangeEssence.toLocaleString()}
								</Text>
							</View>
						)}
						{accountDetail.rp !== undefined && accountDetail.rp !== null && (
							<View style={styles.assetItem}>
								<Text style={styles.assetLabel}>RP</Text>
								<Text style={[styles.assetValue, { color: "#ff6b6b" }]}>
									{accountDetail.rp.toLocaleString()}
								</Text>
							</View>
						)}
					</View>
				</View>

				{/* Additional Info Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Gem size={16} color={colors["lol-gold"]} />
						<Text style={styles.sectionTitle}>Thông tin bổ sung</Text>
					</View>
					<View style={styles.infoGrid}>
						{account?.id && (
							<View style={styles.infoItem}>
								<Text style={styles.infoLabel}>ID tài khoản</Text>
								<Text style={styles.infoValue}>{account.id}</Text>
							</View>
						)}
						{account?.status && (
							<View style={styles.infoItem}>
								<Text style={styles.infoLabel}>Trạng thái</Text>
								<Text style={[
									styles.infoValue,
									{
										color: account.status === "available" ? "#10B981" :
											account.status === "sold" ? colors.destructive :
											account.status === "renting" ? "#F59E0B" : colors.mutedForeground
									}
								]}>
									{account.status === "available" ? "Có sẵn" :
										account.status === "sold" ? "Đã bán" :
										account.status === "renting" ? "Đang thuê" : account.status}
								</Text>
							</View>
						)}
						{account?.createdAt && (
							<View style={styles.infoItem}>
								<Text style={styles.infoLabel}>Ngày tạo</Text>
								<Text style={styles.infoValue}>
									{account.createdAt.toDate ? 
										account.createdAt.toDate().toLocaleDateString("vi-VN") :
										account.createdAt instanceof Date ?
											account.createdAt.toLocaleDateString("vi-VN") :
											new Date((account.createdAt as any).seconds * 1000).toLocaleDateString("vi-VN")
									}
								</Text>
							</View>
						)}
						{accountDetail.rentPricePerHour !== undefined && accountDetail.rentPricePerHour !== null && accountDetail.rentPricePerHour > 0 && (
							<View style={styles.infoItem}>
								<Text style={styles.infoLabel}>Giá thuê/giờ</Text>
								<Text style={[styles.infoValue, { color: colors["lol-gold"] }]}>
									{formatPrice(accountDetail.rentPricePerHour)}
								</Text>
							</View>
						)}
					</View>
				</View>

				{/* Spacer for fixed bottom */}
				<View style={{ height: 100 }} />
			</ScrollView>

			{/* Fixed Bottom CTA */}
			{account.status === "available" && (
				<View style={styles.bottomCTA}>
					<View style={styles.priceContainer}>
						<Text style={styles.priceLabel}>Giá bán</Text>
						<Text style={styles.priceValue}>
							{formatPrice(accountDetail.price)}
						</Text>
					</View>
					<View style={styles.actionButtons}>
						{accountDetail.rentPricePerHour && accountDetail.rentPricePerHour > 0 && (
							<TouchableOpacity style={styles.rentButton} onPress={handleRent}>
								<Clock size={18} color={colors.foreground} />
								<Text style={styles.rentButtonText}>Thuê</Text>
							</TouchableOpacity>
						)}
						{accountDetail.price > 0 && (
							<TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
								<ShoppingCart size={18} color={colors.primaryForeground} />
								<Text style={styles.buyButtonText}>Mua</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
			)}

			{/* Reclaim Button for Owner/Admin when account is renting */}
			{account.status === "renting" && isOwnerOrAdmin && (
				<View style={styles.bottomCTA}>
					<View style={styles.priceContainer}>
						<Text style={styles.priceLabel}>Trạng thái</Text>
						<Text style={[styles.priceValue, { color: "#F59E0B" }]}>
							Đang được thuê
						</Text>
					</View>
					<TouchableOpacity
						style={[styles.reclaimButton, reclaiming && styles.reclaimButtonDisabled]}
						onPress={handleReclaim}
						disabled={reclaiming}
					>
						{reclaiming ? (
							<ActivityIndicator size="small" color={colors.primaryForeground} />
						) : (
							<>
								<Text style={styles.reclaimButtonText}>Thu hồi</Text>
							</>
						)}
					</TouchableOpacity>
				</View>
			)}

			{/* Buy Modal */}
			<Modal
				visible={buyModalOpen}
				transparent
				animationType="fade"
				onRequestClose={closeBuyModal}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Mua tài khoản</Text>

						<View style={styles.modalInfo}>
							<Text style={styles.modalLabel}>Tài khoản:</Text>
							<Text style={styles.modalValue}>{accountDetail.username}</Text>
						</View>

						<View style={styles.modalInfo}>
							<Text style={styles.modalLabel}>Giá:</Text>
							<Text style={[styles.modalValue, { color: colors["lol-gold"] }]}>
								{formatPrice(accountDetail.price)}
							</Text>
						</View>

						{qrUrl && (
							<ScrollView style={styles.qrScrollView}>
								<View style={styles.qrContainer}>
									<Text style={styles.qrTitle}>Quét mã QR để thanh toán</Text>
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
											<Text style={styles.bankInfoValue}>
												{ADMIN_BANK.account_number}
											</Text>
										</View>
										<View style={styles.bankInfoRow}>
											<Text style={styles.bankInfoLabel}>Chủ TK:</Text>
											<Text style={styles.bankInfoValue}>
												{ADMIN_BANK.account_name}
											</Text>
										</View>
										<View style={styles.bankInfoRow}>
											<Text style={styles.bankInfoLabel}>Nội dung:</Text>
											<Text style={[styles.bankInfoValue, { color: colors.primary }]}>
												MUAACC {account?.id} {account?.sellerId}
											</Text>
										</View>
									</View>
								</View>
							</ScrollView>
						)}

						<TouchableOpacity
							style={styles.checkPaymentButton}
							onPress={handleCheckPayment}
						>
							<Text style={styles.checkPaymentButtonText}>
								Kiểm tra thanh toán
							</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.closeButton} onPress={closeBuyModal}>
							<Text style={styles.closeButtonText}>Đóng</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Rent Modal */}
			<Modal
				visible={rentModalOpen}
				transparent
				animationType="fade"
				onRequestClose={closeRentModal}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Thuê tài khoản</Text>

						<View style={styles.modalInfo}>
							<Text style={styles.modalLabel}>Tài khoản:</Text>
							<Text style={styles.modalValue}>{accountDetail.username}</Text>
						</View>

						{!selectedRental && (
							<>
								<Text style={styles.rentalOptionsTitle}>
									Chọn thời gian thuê:
								</Text>
								<View style={styles.rentalOptions}>
									{getRentalOptions(accountDetail.rentPricePerHour || 0).map((option) => (
										<TouchableOpacity
											key={option.hours}
											style={styles.rentalOption}
											onPress={() =>
												generateQRForRent(option.hours, option.price)
											}
										>
											<Clock size={20} color={colors.primary} />
											<View style={styles.rentalOptionInfo}>
												<Text style={styles.rentalOptionLabel}>
													{option.label}
												</Text>
												<Text style={styles.rentalOptionPrice}>
													{formatPrice(option.price)}
												</Text>
											</View>
										</TouchableOpacity>
									))}
								</View>
							</>
						)}

						{selectedRental && qrUrl && (
							<ScrollView style={styles.qrScrollView}>
								<View style={styles.qrContainer}>
									<View style={styles.selectedRentalInfo}>
										<Text style={styles.selectedRentalLabel}>
											Thời gian thuê:
										</Text>
										<Text style={styles.selectedRentalValue}>
											{
												getRentalOptions(accountDetail.rentPricePerHour || 0).find((o) => o.hours === selectedRental)
													?.label
											}
										</Text>
									</View>
									<View style={styles.selectedRentalInfo}>
										<Text style={styles.selectedRentalLabel}>Giá thuê:</Text>
										<Text
											style={[
												styles.selectedRentalValue,
												{ color: colors["lol-gold"] },
											]}
										>
											{formatPrice(
												getRentalOptions(accountDetail.rentPricePerHour || 0).find((o) => o.hours === selectedRental)
													?.price || 0
											)}
										</Text>
									</View>

									<Text style={styles.qrTitle}>Quét mã QR để thanh toán</Text>
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
											<Text style={styles.bankInfoValue}>
												{ADMIN_BANK.account_number}
											</Text>
										</View>
										<View style={styles.bankInfoRow}>
											<Text style={styles.bankInfoLabel}>Chủ TK:</Text>
											<Text style={styles.bankInfoValue}>
												{ADMIN_BANK.account_name}
											</Text>
										</View>
										<View style={styles.bankInfoRow}>
											<Text style={styles.bankInfoLabel}>Nội dung:</Text>
											<Text style={[styles.bankInfoValue, { color: colors.primary }]}>
												THUEACC {account?.id} {selectedRental}H {account?.sellerId}
											</Text>
										</View>
									</View>
								</View>
							</ScrollView>
						)}

						{selectedRental && (
							<TouchableOpacity
								style={styles.checkPaymentButton}
								onPress={handleCheckPayment}
							>
								<Text style={styles.checkPaymentButtonText}>
									Kiểm tra thanh toán
								</Text>
							</TouchableOpacity>
						)}

						<TouchableOpacity style={styles.closeButton} onPress={closeRentModal}>
							<Text style={styles.closeButtonText}>
								{selectedRental ? "Đóng" : "Hủy"}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	header: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 50,
		backgroundColor: `${colors.card}E6`,
		borderBottomWidth: 1,
		borderBottomColor: `${colors.border}80`,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingTop: 60,
		paddingBottom: 12,
	},
	backButton: {
		padding: 8,
		borderRadius: 999,
	},
	title: {
		fontSize: 18,
		fontFamily: "Inter_600SemiBold",
		color: colors.foreground,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingTop: 120,
		paddingHorizontal: 16,
		paddingBottom: 16,
		gap: 24,
	},
	profileHeader: {
		position: "relative",
		backgroundColor: colors.card,
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: `${colors.border}80`,
		overflow: "hidden",
	},
	profileGlow: {
		position: "absolute",
		top: 0,
		right: 0,
		width: 128,
		height: 128,
		backgroundColor: `${colors.primary}1A`,
		borderRadius: 999,
	},
	profileContent: {
		position: "relative",
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
	},
	avatarContainer: {
		position: "relative",
	},
	avatarWrapper: {
		width: 80,
		height: 80,
		borderRadius: 16,
		overflow: "hidden",
		borderWidth: 2,
		borderColor: colors["lol-gold"],
	},
	avatar: {
		width: "100%",
		height: "100%",
	},
	levelBadge: {
		position: "absolute",
		bottom: -8,
		right: -8,
		backgroundColor: colors["lol-gold"],
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 6,
	},
	levelText: {
		fontSize: 12,
		fontFamily: "Inter_700Bold",
		color: colors.primaryForeground,
	},
	profileInfo: {
		flex: 1,
		gap: 4,
	},
	profileNameRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	profileName: {
		fontSize: 20,
		fontFamily: "Inter_700Bold",
		color: colors.foreground,
	},
	profileTitle: {
		fontSize: 13,
		fontFamily: "Inter_500Medium",
		color: colors.primary,
	},
	serverBadge: {
		backgroundColor: `${colors.primary}33`,
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 4,
	},
	serverText: {
		fontSize: 12,
		fontFamily: "Inter_500Medium",
		color: colors.primary,
	},
	profileDescription: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	section: {
		gap: 12,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: "Inter_600SemiBold",
		color: colors.foreground,
	},
	ranksGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		justifyContent: "space-between",
	},
	emptyRanksContainer: {
		padding: 24,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: `${colors.card}99`,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: `${colors.border}4D`,
	},
	emptyRanksText: {
		fontSize: 14,
		color: colors.mutedForeground,
		fontFamily: "Inter_500Medium",
	},
	statsGrid: {
		flexDirection: "row",
		gap: 12,
	},
	assetsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	assetItem: {
		flex: 1,
		minWidth: "45%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 12,
		backgroundColor: `${colors.card}99`,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: `${colors.border}4D`,
	},
	assetLabel: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	assetValue: {
		fontSize: 16,
		fontFamily: "Inter_700Bold",
		color: colors.foreground,
	},
	infoGrid: {
		flexDirection: "column",
		gap: 12,
	},
	infoItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 12,
		backgroundColor: `${colors.card}99`,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: `${colors.border}4D`,
	},
	infoLabel: {
		fontSize: 14,
		color: colors.mutedForeground,
		fontFamily: "Inter_500Medium",
	},
	infoValue: {
		fontSize: 14,
		fontFamily: "Inter_600SemiBold",
		color: colors.foreground,
	},
	bottomCTA: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		padding: 16,
		backgroundColor: `${colors.card}F2`,
		borderTopWidth: 1,
		borderTopColor: `${colors.border}80`,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	priceContainer: {
		flex: 1,
		gap: 2,
	},
	priceLabel: {
		fontSize: 12,
		color: colors.mutedForeground,
	},
	priceValue: {
		fontSize: 18,
		fontFamily: "Inter_700Bold",
		color: colors["lol-gold"],
	},
	actionButtons: {
		flexDirection: "row",
		gap: 8,
	},
	rentButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: colors.card,
		borderWidth: 1,
		borderColor: colors.border,
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 12,
	},
	rentButtonText: {
		fontSize: 14,
		fontFamily: "Inter_600SemiBold",
		color: colors.foreground,
	},
	buyButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: colors.primary,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 12,
	},
	buyButtonText: {
		fontSize: 14,
		fontFamily: "Inter_600SemiBold",
		color: colors.primaryForeground,
	},
	reclaimButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		backgroundColor: colors.destructive,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 12,
	},
	reclaimButtonDisabled: {
		opacity: 0.6,
	},
	reclaimButtonText: {
		fontSize: 14,
		fontFamily: "Inter_600SemiBold",
		color: colors.primaryForeground,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.7)",
	},
	modalContent: {
		width: "90%",
		maxWidth: 400,
		maxHeight: "80%",
		backgroundColor: colors.card,
		borderRadius: 16,
		padding: 24,
		gap: 16,
	},
	modalTitle: {
		fontSize: 20,
		fontFamily: "Inter_700Bold",
		color: colors.foreground,
		marginBottom: 8,
	},
	modalInfo: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	modalLabel: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	modalValue: {
		fontSize: 16,
		fontFamily: "Inter_600SemiBold",
		color: colors.foreground,
	},
	qrScrollView: {
		maxHeight: 400,
	},
	qrContainer: {
		gap: 12,
		alignItems: "center",
	},
	qrTitle: {
		fontSize: 14,
		color: colors.mutedForeground,
		textAlign: "center",
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
	},
	bankInfoLabel: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	bankInfoValue: {
		fontSize: 14,
		fontFamily: "Inter_500Medium",
		color: colors.foreground,
	},
	checkPaymentButton: {
		backgroundColor: colors.primary,
		padding: 14,
		borderRadius: 12,
		marginTop: 8,
	},
	checkPaymentButtonText: {
		fontSize: 16,
		fontFamily: "Inter_600SemiBold",
		color: colors.primaryForeground,
		textAlign: "center",
	},
	closeButton: {
		backgroundColor: colors.muted,
		padding: 14,
		borderRadius: 12,
	},
	closeButtonText: {
		fontSize: 16,
		fontFamily: "Inter_600SemiBold",
		color: colors.foreground,
		textAlign: "center",
	},
	rentalOptionsTitle: {
		fontSize: 14,
		fontFamily: "Inter_500Medium",
		color: colors.foreground,
		marginTop: 8,
	},
	rentalOptions: {
		gap: 12,
	},
	rentalOption: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		padding: 16,
		backgroundColor: `${colors.card}80`,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.border,
	},
	rentalOptionInfo: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	rentalOptionLabel: {
		fontSize: 16,
		fontFamily: "Inter_500Medium",
		color: colors.foreground,
	},
	rentalOptionPrice: {
		fontSize: 16,
		fontFamily: "Inter_700Bold",
		color: colors["lol-gold"],
	},
	selectedRentalInfo: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 4,
	},
	selectedRentalLabel: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	selectedRentalValue: {
		fontSize: 16,
		fontFamily: "Inter_600SemiBold",
		color: colors.foreground,
	},
});
