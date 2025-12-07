import Background from "@/components/Background";
import { colors } from "@/libs/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Upload,
  X
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View
} from "react-native";

const ranks = [
	"Unranked", "Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"
];

const divisions = ["I", "II", "III", "IV"];

const regions = [
	"BANDLE CITY", "BILGEWATER", "DEMACIA", "FRELJORD", "IONIA", "IXTAL",
	"NOXUS", "PILTOVER", "SHADOW ISLES", "SHURIMA", "TARGON", "VOID", "ZAUN"
];

interface FormData {
	username: string;
	title: string;
	level: string;
	champions: string;
	skins: string;
	blueEssence: string;
	orangeEssence: string;
	rp: string;
	honorLevel: string;
	masteryPoints: string;
	region: string;
	// Ranks
	soloRank: string;
	soloDivision: string;
	soloLP: string;
	soloWins: string;
	flexRank: string;
	flexDivision: string;
	flexLP: string;
	flexWins: string;
	tftRank: string;
	tftDivision: string;
	tftLP: string;
	tftWins: string;
	// Pricing
	price: string;
	rentPricePerHour: string;
	description: string;
}

// Custom Select Component
interface SelectProps {
	value: string;
	placeholder: string;
	options: { value: string; label: string }[];
	onValueChange: (value: string) => void;
	style?: object;
}

const Select = ({ value, placeholder, options, onValueChange, style }: SelectProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const displayValue = value
		? options.find((option) => option.value === value)?.label
		: placeholder;

	return (
		<View style={[{ position: "relative" }, style]}>
			<TouchableOpacity
				style={styles.selectButton}
				onPress={() => setIsOpen(!isOpen)}
			>
				<Text style={styles.selectButtonText}>{displayValue}</Text>
				<Ionicons name="chevron-down" size={20} color={colors.mutedForeground} />
			</TouchableOpacity>
			{isOpen && (
				<View style={styles.selectDropdown}>
					<ScrollView 
						style={{ maxHeight: 200 }}
						nestedScrollEnabled={true}
						showsVerticalScrollIndicator={true}
					>
						{options.map((option) => (
							<TouchableOpacity
								key={option.value}
								style={styles.selectOption}
								onPress={() => {
									onValueChange(option.value);
									setIsOpen(false);
								}}
								activeOpacity={0.7}
							>
								<Text style={styles.selectOptionText}>{option.label}</Text>
								{value === option.value && (
									<Ionicons name="checkmark" size={20} color={colors.primary} />
								)}
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>
			)}
		</View>
	);
};

export default function NewAccountPage() {
	const [forSale, setForSale] = useState(true);
	const [forRent, setForRent] = useState(false);
	const [image, setImage] = useState<string | null>(null);
	const [formData, setFormData] = useState<FormData>({
		username: "",
		title: "",
		level: "",
		champions: "",
		skins: "",
		blueEssence: "",
		orangeEssence: "",
		rp: "",
		honorLevel: "",
		masteryPoints: "",
		region: "",
		// Ranks
		soloRank: "",
		soloDivision: "",
		soloLP: "",
		soloWins: "",
		flexRank: "",
		flexDivision: "",
		flexLP: "",
		flexWins: "",
		tftRank: "",
		tftDivision: "",
		tftLP: "",
		tftWins: "",
		// Pricing
		price: "",
		rentPricePerHour: "",
		description: "",
	});

	const handleImageUpload = () => {
		const mockImage = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop";
		setImage(mockImage);
		ToastAndroid.show("Đã thêm ảnh", ToastAndroid.SHORT);
	};

	const removeImage = () => {
		setImage(null);
	};

	const handleSubmit = () => {
		if (!forSale && !forRent) {
			ToastAndroid.show("Vui lòng chọn ít nhất một hình thức: Bán hoặc Cho thuê", ToastAndroid.LONG);
			return;
		}

		const listingTypes = [];
		if (forSale) listingTypes.push("bán");
		if (forRent) listingTypes.push("cho thuê");

		ToastAndroid.show(`Đăng tin thành công! Tài khoản đã được đăng ${listingTypes.join(" và ")}`, ToastAndroid.LONG);
	};

	const rankOptions = ranks.map((rank) => ({ value: rank.toLowerCase(), label: rank }));
	const divisionOptions = divisions.map((div) => ({ value: div, label: div }));
	const regionOptions = regions.map((region) => ({ value: region.toLowerCase(), label: region }));

	const RankSelector = ({
		label,
		rankKey,
		divisionKey,
		lpKey,
		winsKey
	}: {
		label: string;
		rankKey: keyof FormData;
		divisionKey: keyof FormData;
		lpKey: keyof FormData;
		winsKey: keyof FormData;
	}) => (
		<View style={styles.rankSelector}>
			<Text style={styles.rankSelectorLabel}>{label}</Text>
			<View style={styles.rankRow}>
				<Select
					value={formData[rankKey]}
					placeholder="Rank"
					options={rankOptions}
					onValueChange={(value) => setFormData({ ...formData, [rankKey]: value })}
					style={{ flex: 1 }}
				/>
				<Select
					value={formData[divisionKey]}
					placeholder="Division"
					options={divisionOptions}
					onValueChange={(value) => setFormData({ ...formData, [divisionKey]: value })}
					style={{ flex: 1 }}
				/>
			</View>
			<View style={styles.rankRow}>
				<TextInput
					style={styles.input}
					placeholder="LP"
					placeholderTextColor={colors.mutedForeground}
					keyboardType="numeric"
					value={formData[lpKey]}
					onChangeText={(value) => setFormData({ ...formData, [lpKey]: value })}
				/>
				<TextInput
					style={styles.input}
					placeholder="Wins"
					placeholderTextColor={colors.mutedForeground}
					keyboardType="numeric"
					value={formData[winsKey]}
					onChangeText={(value) => setFormData({ ...formData, [winsKey]: value })}
				/>
			</View>
		</View>
	);

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
				<Text style={styles.title}>Đăng Bán/Thuê Tài Khoản</Text>
				<View style={{ width: 24 }} />
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Listing Type - Checkboxes */}
				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Hình thức đăng tin</Text>
					<View style={styles.checkboxContainer}>
						<TouchableOpacity
							style={styles.checkboxRow}
							onPress={() => setForSale(!forSale)}
						>
							<View style={[styles.checkbox, forSale && styles.checkboxChecked]}>
								{forSale && <View style={styles.checkboxInner} />}
							</View>
							<Text style={styles.checkboxLabel}>Bán</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.checkboxRow}
							onPress={() => setForRent(!forRent)}
						>
							<View style={[styles.checkbox, forRent && styles.checkboxChecked]}>
								{forRent && <View style={styles.checkboxInner} />}
							</View>
							<Text style={styles.checkboxLabel}>Cho thuê</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Image Upload */}
				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Ảnh tài khoản</Text>
					<View style={styles.imageUploadContainer}>
						{image ? (
							<View style={styles.imagePreview}>
								<Image
									source={{ uri: image }}
									style={styles.uploadedImage}
									contentFit="cover"
								/>
								<TouchableOpacity
									style={styles.removeImageButton}
									onPress={removeImage}
								>
									<X size={16} color={colors.primaryForeground} />
								</TouchableOpacity>
							</View>
						) : (
							<TouchableOpacity
								style={styles.uploadButton}
								onPress={handleImageUpload}
							>
								<Upload size={24} color={colors.mutedForeground} />
								<Text style={styles.uploadButtonText}>Thêm ảnh</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>

				{/* Basic Account Info */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

					<View style={styles.fieldGroup}>
						<Text style={styles.fieldLabel}>Tên tài khoản</Text>
						<TextInput
							style={styles.textInput}
							placeholder="VD: mid24"
							placeholderTextColor={colors.mutedForeground}
							value={formData.username}
							onChangeText={(value) => setFormData({ ...formData, username: value })}
						/>
					</View>

					<View style={styles.fieldGroup}>
						<Text style={styles.fieldLabel}>Tiêu đề</Text>
						<TextInput
							style={styles.textInput}
							placeholder="VD: ACC Challenger 500LP Full Skin"
							placeholderTextColor={colors.mutedForeground}
							value={formData.title}
							onChangeText={(value) => setFormData({ ...formData, title: value })}
						/>
					</View>

					<View style={styles.twoColumnRow}>
						<View style={styles.halfField}>
							<Text style={styles.fieldLabel}>Level</Text>
							<TextInput
								style={styles.textInput}
								placeholder="902"
								placeholderTextColor={colors.mutedForeground}
								keyboardType="numeric"
								value={formData.level}
								onChangeText={(value) => setFormData({ ...formData, level: value })}
							/>
						</View>
						<View style={styles.halfField}>
							<Text style={styles.fieldLabel}>Cấp danh dự</Text>
							<TextInput
								style={styles.textInput}
								placeholder="4"
								placeholderTextColor={colors.mutedForeground}
								keyboardType="numeric"
								value={formData.honorLevel}
								onChangeText={(value) => setFormData({ ...formData, honorLevel: value })}
							/>
						</View>
					</View>

					<View style={styles.twoColumnRow}>
						<View style={styles.halfField}>
							<Text style={styles.fieldLabel}>Điểm thông thạo</Text>
							<TextInput
								style={styles.textInput}
								placeholder="1153"
								placeholderTextColor={colors.mutedForeground}
								keyboardType="numeric"
								value={formData.masteryPoints}
								onChangeText={(value) => setFormData({ ...formData, masteryPoints: value })}
							/>
						</View>
						<View style={styles.halfField}>
							<Text style={styles.fieldLabel}>Vùng đất</Text>
							<Select
								value={formData.region}
								placeholder="Chọn vùng"
								options={regionOptions}
								onValueChange={(value) => setFormData({ ...formData, region: value })}
							/>
						</View>
					</View>
				</View>

				{/* Champions & Skins */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Tướng & Skin</Text>

					<View style={styles.twoColumnRow}>
						<View style={styles.halfField}>
							<Text style={styles.fieldLabel}>Số tướng</Text>
							<TextInput
								style={styles.textInput}
								placeholder="120"
								placeholderTextColor={colors.mutedForeground}
								keyboardType="numeric"
								value={formData.champions}
								onChangeText={(value) => setFormData({ ...formData, champions: value })}
							/>
						</View>
						<View style={styles.halfField}>
							<Text style={styles.fieldLabel}>Số Skin</Text>
							<TextInput
								style={styles.textInput}
								placeholder="85"
								placeholderTextColor={colors.mutedForeground}
								keyboardType="numeric"
								value={formData.skins}
								onChangeText={(value) => setFormData({ ...formData, skins: value })}
							/>
						</View>
					</View>
				</View>

				{/* Currency */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Tiền tệ trong game</Text>

					<View style={styles.twoColumnRow}>
						<View style={styles.halfField}>
							<Text style={styles.fieldLabel}>Tinh Hoa Xanh</Text>
							<TextInput
								style={styles.textInput}
								placeholder="15000"
								placeholderTextColor={colors.mutedForeground}
								keyboardType="numeric"
								value={formData.blueEssence}
								onChangeText={(value) => setFormData({ ...formData, blueEssence: value })}
							/>
						</View>
						<View style={styles.halfField}>
							<Text style={styles.fieldLabel}>Tinh Hoa Cam</Text>
							<TextInput
								style={styles.textInput}
								placeholder="3200"
								placeholderTextColor={colors.mutedForeground}
								keyboardType="numeric"
								value={formData.orangeEssence}
								onChangeText={(value) => setFormData({ ...formData, orangeEssence: value })}
							/>
						</View>
					</View>

					<View style={styles.fieldGroup}>
						<Text style={styles.fieldLabel}>RP</Text>
						<TextInput
							style={styles.textInput}
							placeholder="0"
							placeholderTextColor={colors.mutedForeground}
							keyboardType="numeric"
							value={formData.rp}
							onChangeText={(value) => setFormData({ ...formData, rp: value })}
						/>
					</View>
				</View>

				{/* Ranks */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Rank</Text>

					<RankSelector
						label="Đơn/Đôi (Solo/Duo)"
						rankKey="soloRank"
						divisionKey="soloDivision"
						lpKey="soloLP"
						winsKey="soloWins"
					/>

					<RankSelector
						label="Linh Hoạt 5v5 (Flex)"
						rankKey="flexRank"
						divisionKey="flexDivision"
						lpKey="flexLP"
						winsKey="flexWins"
					/>

					<RankSelector
						label="ĐTCL (TFT)"
						rankKey="tftRank"
						divisionKey="tftDivision"
						lpKey="tftLP"
						winsKey="tftWins"
					/>
				</View>

				{/* Pricing */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Giá</Text>

					{forSale && (
						<View style={styles.fieldGroup}>
							<Text style={styles.fieldLabel}>Giá bán (VNĐ)</Text>
							<TextInput
								style={styles.textInput}
								placeholder="2,500,000"
								placeholderTextColor={colors.mutedForeground}
								keyboardType="numeric"
								value={formData.price}
								onChangeText={(value) => setFormData({ ...formData, price: value })}
							/>
						</View>
					)}

					{forRent && (
						<View style={styles.fieldGroup}>
							<Text style={styles.fieldLabel}>Giá thuê / giờ (VNĐ)</Text>
							<TextInput
								style={styles.textInput}
								placeholder="10,000"
								placeholderTextColor={colors.mutedForeground}
								keyboardType="numeric"
								value={formData.rentPricePerHour}
								onChangeText={(value) => setFormData({ ...formData, rentPricePerHour: value })}
							/>
						</View>
					)}

					{!forSale && !forRent && (
						<Text style={styles.helperText}>Vui lòng chọn hình thức đăng tin ở trên</Text>
					)}
				</View>

				{/* Description */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Mô tả</Text>
					<TextInput
						style={[styles.textInput, styles.textArea]}
						placeholder="Mô tả chi tiết về tài khoản, skin nổi bật, lịch sử rank..."
						placeholderTextColor={colors.mutedForeground}
						multiline
						numberOfLines={5}
						textAlignVertical="top"
						value={formData.description}
						onChangeText={(value) => setFormData({ ...formData, description: value })}
					/>
				</View>

				{/* Submit Button */}
				<TouchableOpacity
					style={styles.submitButton}
					onPress={handleSubmit}
				>
					<Plus size={20} color={colors.primaryForeground} />
					<Text style={styles.submitButtonText}>Đăng tin</Text>
				</TouchableOpacity>

				{/* Bottom Spacer */}
				<View style={{ height: 40 }} />
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
	section: {
		backgroundColor: `${colors.card}80`,
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: `${colors.border}80`,
		gap: 12,
	},
	sectionLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: colors.foreground,
		marginBottom: 4,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.foreground,
	},
	checkboxContainer: {
		flexDirection: "row",
		gap: 24,
	},
	checkboxRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	checkbox: {
		width: 20,
		height: 20,
		borderRadius: 4,
		borderWidth: 2,
		borderColor: colors.border,
		alignItems: "center",
		justifyContent: "center",
	},
	checkboxChecked: {
		borderColor: colors.primary,
		backgroundColor: `${colors.primary}20`,
	},
	checkboxInner: {
		width: 12,
		height: 12,
		borderRadius: 2,
		backgroundColor: colors.primary,
	},
	checkboxLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: colors.foreground,
	},
	imageUploadContainer: {
		flexDirection: "row",
		gap: 12,
	},
	uploadButton: {
		width: 128,
		height: 128,
		borderRadius: 12,
		borderWidth: 2,
		borderStyle: "dashed",
		borderColor: `${colors.border}80`,
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	uploadButtonText: {
		fontSize: 12,
		color: colors.mutedForeground,
	},
	imagePreview: {
		position: "relative",
		width: 128,
		height: 128,
		borderRadius: 12,
		overflow: "hidden",
		borderWidth: 1,
		borderColor: `${colors.border}80`,
	},
	uploadedImage: {
		width: "100%",
		height: "100%",
	},
	removeImageButton: {
		position: "absolute",
		top: 4,
		right: 4,
		backgroundColor: colors.destructive,
		borderRadius: 999,
		padding: 4,
	},
	fieldGroup: {
		gap: 8,
	},
	fieldLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: colors.foreground,
	},
	textInput: {
		backgroundColor: `${colors.muted}4D`,
		borderWidth: 1,
		borderColor: `${colors.border}80`,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 14,
		color: colors.foreground,
	},
	textArea: {
		minHeight: 120,
		paddingTop: 12,
	},
	twoColumnRow: {
		flexDirection: "row",
		gap: 12,
	},
	halfField: {
		flex: 1,
		gap: 8,
	},
	selectButton: {
		backgroundColor: `${colors.muted}4D`,
		borderWidth: 1,
		borderColor: `${colors.border}80`,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	selectButtonText: {
		fontSize: 14,
		color: colors.foreground,
	},
	selectDropdown: {
		position: "absolute",
		top: "100%",
		left: 0,
		right: 0,
		backgroundColor: colors.card,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: `${colors.border}80`,
		marginTop: 4,
		zIndex: 1000,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
		overflow: "hidden",
	},
	selectOption: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: `${colors.border}40`,
		backgroundColor: colors.card,
	},
	selectOptionText: {
		fontSize: 14,
		color: colors.foreground,
	},
	rankSelector: {
		backgroundColor: `${colors.muted}33`,
		borderRadius: 12,
		padding: 12,
		gap: 12,
	},
	rankSelectorLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: colors.foreground,
	},
	rankRow: {
		flexDirection: "row",
		gap: 12,
	},
	input: {
		flex: 1,
		backgroundColor: `${colors.muted}4D`,
		borderWidth: 1,
		borderColor: `${colors.border}80`,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 14,
		color: colors.foreground,
	},
	helperText: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	submitButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		backgroundColor: colors.primary,
		paddingVertical: 16,
		borderRadius: 12,
	},
	submitButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.primaryForeground,
	},
});
