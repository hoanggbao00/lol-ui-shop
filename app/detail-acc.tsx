import Background from "@/components/Background";
import RankCard from "@/components/detail-account/RankCard";
import StatBadge from "@/components/detail-account/StatBadge";
import { ADMIN_BANK } from "@/libs/admin-bank";
import { colors } from "@/libs/colors";
import type { AccountDetail } from "@/types/account";
import { Image } from "expo-image";
import { router } from "expo-router";
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
import React, { useState } from "react";
import {
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	ToastAndroid,
	TouchableOpacity,
	View
} from "react-native";

// Mock data based on the reference
const mockAccount: AccountDetail = {
	id: "acc-001",
	username: "mid24",
	level: 902,
	avatarUrl:
		"https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/5799.png",
	server: "VN",
	price: 2500000,
	ranks: [
		{
			mode: "LH 5V5",
			rank: "LỤC BẢO III",
			tier: "emerald",
			wins: 200,
			lp: 55,
			icon: "",
		},
		{
			mode: "ĐƠN/ĐÔI",
			rank: "LỤC BẢO IV",
			tier: "emerald",
			wins: 313,
			lp: 84,
			icon: "",
		},
		{
			mode: "ĐTCL",
			rank: "VÀNG III",
			tier: "gold",
			wins: 37,
			lp: 99,
			icon: "",
		},
		{
			mode: "CẶP ĐÔI HOÀN HẢO",
			rank: "CHƯA CÓ HẠNG",
			tier: "unranked",
			wins: 0,
			lp: 0,
			icon: "",
		},
		{
			mode: "MÙA TRƯỚC",
			rank: "LỤC BẢO",
			tier: "emerald",
			wins: 0,
			lp: 0,
			icon: "",
		},
	],
	honorLevel: 4,
	masteryPoints: 1153,
	region: "SHURIMA",
	champions: 120,
	skins: 85,
	blueEssence: 15000,
	orangeEssence: 3200,
	description: "Acc chính chủ, full tướng, nhiều skin hiếm",
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
const RENTAL_OPTIONS = [
	{ hours: 48, label: "48 giờ", price: 50000 },
	{ hours: 72, label: "72 giờ", price: 70000 },
	{ hours: 120, label: "5 ngày", price: 100000 },
	{ hours: 168, label: "7 ngày", price: 130000 },
];

export default function DetailAcc() {
	const [buyModalOpen, setBuyModalOpen] = useState(false);
	const [rentModalOpen, setRentModalOpen] = useState(false);
	const [qrUrl, setQrUrl] = useState("");
	const [selectedRental, setSelectedRental] = useState<number | null>(null);

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
		const amount = mockAccount.price;
		const content = `MUAACC ${mockAccount.id} ${MOCK_USER_ID}`;
		const qrApiUrl = `https://img.vietqr.io/image/${ADMIN_BANK.bin}-${ADMIN_BANK.account_number}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(ADMIN_BANK.account_name)}`;
		setQrUrl(qrApiUrl);
	};

	const generateQRForRent = (hours: number, price: number) => {
		const content = `THUEACC ${mockAccount.id} ${hours}H ${MOCK_USER_ID}`;
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
									source={{ uri: mockAccount.avatarUrl }}
									style={styles.avatar}
									contentFit="cover"
								/>
							</View>
							{/* Level Badge */}
							<View style={styles.levelBadge}>
								<Text style={styles.levelText}>{mockAccount.level}</Text>
							</View>
						</View>

						{/* Info */}
						<View style={styles.profileInfo}>
							<View style={styles.profileNameRow}>
								<Text style={styles.profileName}>{mockAccount.username}</Text>
								<View style={styles.serverBadge}>
									<Text style={styles.serverText}>{mockAccount.server}</Text>
								</View>
							</View>
							<Text style={styles.profileDescription}>
								{mockAccount.description}
							</Text>
						</View>
					</View>
				</View>

				{/* Ranks Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Crown size={16} color={colors["lol-gold"]} />
						<Text style={styles.sectionTitle}>Xếp hạng</Text>
					</View>
					<View style={styles.ranksGrid}>
						{mockAccount.ranks.map((rank, index) => (
							<RankCard key={index.toString()} rank={rank} />
						))}
					</View>
				</View>

				{/* Stats Grid */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Trophy size={16} color={colors["lol-gold"]} />
						<Text style={styles.sectionTitle}>Thống kê</Text>
					</View>
					<View style={styles.statsGrid}>
						<StatBadge
							label="Vinh danh"
							value={`Cấp ${mockAccount.honorLevel}`}
							icon={<Star size={24} color={colors.primary} />}
						/>
						<StatBadge
							label="Điểm thông thạo"
							value={mockAccount.masteryPoints.toLocaleString()}
							icon={<Swords size={24} color={colors.primary} />}
						/>
						<StatBadge
							label="Cờ hiệu"
							value={mockAccount.region}
							icon={<Users size={24} color={colors.primary} />}
						/>
					</View>
				</View>

				{/* Assets Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Gem size={16} color={colors["lol-gold"]} />
						<Text style={styles.sectionTitle}>Tài sản</Text>
					</View>
					<View style={styles.assetsGrid}>
						<View style={styles.assetItem}>
							<Text style={styles.assetLabel}>Tướng</Text>
							<Text style={styles.assetValue}>{mockAccount.champions}</Text>
						</View>
						<View style={styles.assetItem}>
							<Text style={styles.assetLabel}>Skin</Text>
							<Text style={styles.assetValue}>{mockAccount.skins}</Text>
						</View>
						<View style={styles.assetItem}>
							<Text style={styles.assetLabel}>Tinh hoa xanh</Text>
							<Text style={[styles.assetValue, { color: colors.primary }]}>
								{mockAccount.blueEssence.toLocaleString()}
							</Text>
						</View>
						<View style={styles.assetItem}>
							<Text style={styles.assetLabel}>Tinh hoa cam</Text>
							<Text style={[styles.assetValue, { color: colors["lol-gold"] }]}>
								{mockAccount.orangeEssence.toLocaleString()}
							</Text>
						</View>
					</View>
				</View>

				{/* Spacer for fixed bottom */}
				<View style={{ height: 100 }} />
			</ScrollView>

			{/* Fixed Bottom CTA */}
			<View style={styles.bottomCTA}>
				<View style={styles.priceContainer}>
					<Text style={styles.priceLabel}>Giá bán</Text>
					<Text style={styles.priceValue}>
						{formatPrice(mockAccount.price)}
					</Text>
				</View>
				<View style={styles.actionButtons}>
					<TouchableOpacity style={styles.rentButton} onPress={handleRent}>
						<Clock size={18} color={colors.foreground} />
						<Text style={styles.rentButtonText}>Thuê</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
						<ShoppingCart size={18} color={colors.primaryForeground} />
						<Text style={styles.buyButtonText}>Mua</Text>
					</TouchableOpacity>
				</View>
			</View>

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
							<Text style={styles.modalValue}>{mockAccount.username}</Text>
						</View>

						<View style={styles.modalInfo}>
							<Text style={styles.modalLabel}>Giá:</Text>
							<Text style={[styles.modalValue, { color: colors["lol-gold"] }]}>
								{formatPrice(mockAccount.price)}
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
												MUAACC {mockAccount.id} {MOCK_USER_ID}
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
							<Text style={styles.modalValue}>{mockAccount.username}</Text>
						</View>

						{!selectedRental && (
							<>
								<Text style={styles.rentalOptionsTitle}>
									Chọn thời gian thuê:
								</Text>
								<View style={styles.rentalOptions}>
									{RENTAL_OPTIONS.map((option) => (
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
												RENTAL_OPTIONS.find((o) => o.hours === selectedRental)
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
												RENTAL_OPTIONS.find((o) => o.hours === selectedRental)
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
												THUEACC {mockAccount.id} {selectedRental}H {MOCK_USER_ID}
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
		fontWeight: "600",
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
		fontWeight: "bold",
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
		fontWeight: "bold",
		color: colors.foreground,
	},
	serverBadge: {
		backgroundColor: `${colors.primary}33`,
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 4,
	},
	serverText: {
		fontSize: 12,
		fontWeight: "500",
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
		fontWeight: "600",
		color: colors.foreground,
	},
	ranksGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		justifyContent: "space-between",
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
		fontWeight: "bold",
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
		fontWeight: "bold",
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
		fontWeight: "600",
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
		fontWeight: "600",
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
		fontWeight: "bold",
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
		fontWeight: "600",
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
		fontWeight: "500",
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
		fontWeight: "600",
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
		fontWeight: "600",
		color: colors.foreground,
		textAlign: "center",
	},
	rentalOptionsTitle: {
		fontSize: 14,
		fontWeight: "500",
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
		fontWeight: "500",
		color: colors.foreground,
	},
	rentalOptionPrice: {
		fontSize: 16,
		fontWeight: "bold",
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
		fontWeight: "600",
		color: colors.foreground,
	},
});
