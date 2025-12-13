import { createAccount, deleteAccount, getAccountById, updateAccount } from '@/actions/account.action';
import Background from "@/components/Background";
import RankSelector from "@/components/RankSelector";
import Select from "@/components/Select";
import { colors } from "@/libs/colors";
import { uploadImageToStorage } from '@/libs/upload';
import { Image } from "expo-image";
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from "expo-router";
import {
	ArrowLeft,
	Plus,
	Trash2,
	Upload,
	X
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
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
	// Login credentials
	loginUsername: string;
	loginPassword: string;
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


export default function EditAccountPage() {
	const { id } = useLocalSearchParams();
	const accountId = Array.isArray(id) ? id[0] : id;

	const [forSale, setForSale] = useState(true);
	const [forRent, setForRent] = useState(false);
	const [image, setImage] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [loading, setLoading] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);

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
		// Login credentials
		loginUsername: "",
		loginPassword: "",
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

	const pickImages = async () => {
    // Xin quyền truy cập (Quan trọng với Android 13+)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      ToastAndroid.show('Quyền bị từ chối', ToastAndroid.SHORT);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false, // Cho phép chọn nhiều ảnh
      quality: 0.7, // Nén ảnh nhẹ bớt (0.0 - 1.0)
    });

    if (!result.canceled) {
      // Lấy danh sách uri
      const uris = result.assets.map(asset => asset.uri);
      setImage(uris[0]);
    }
  };

	const removeImage = () => {
		setImage(null);
	};

	const validateForm = (): string | null => {
		// Validate image
		// if (!image) {
		// 	return "Vui lòng chọn ảnh tài khoản";
		// }

		// Validate username
		if (!formData.username.trim()) {
			return "Vui lòng nhập tên tài khoản";
		}

		// Validate login credentials
		if (!formData.loginUsername.trim()) {
			return "Vui lòng nhập tên đăng nhập";
		}

		if (!formData.loginPassword.trim()) {
			return "Vui lòng nhập mật khẩu đăng nhập";
		}

		// Validate listing type
		if (!forSale && !forRent) {
			return "Vui lòng chọn ít nhất một hình thức: Bán hoặc Cho thuê";
		}

		// Validate pricing
		if (forSale && !formData.price.trim()) {
			return "Vui lòng nhập giá bán";
		}

		if (forRent && !formData.rentPricePerHour.trim()) {
			return "Vui lòng nhập giá thuê";
		}

		return null;
	};

	const handleSubmit = async () => {
		console.log('=== SUBMIT STARTED ===');
		
		// Validate form
		const error = validateForm();
		if (error) {
			console.log('Validation error:', error);
			ToastAndroid.show(error, ToastAndroid.LONG);
			return;
		}

		console.log('Validation passed');
		setSubmitting(true);
		
		try {
			// 1. Upload image first (if new image selected)
			let thumbnailUrl: string | undefined = undefined;
			if (image && !image.startsWith('http')) {
				setUploading(true);
				console.log('Starting image upload...');
				thumbnailUrl = await uploadImageToStorage(image, 'account_images');
				setUploading(false);
			} else if (image && image.startsWith('http')) {
				// Keep existing image URL
				thumbnailUrl = image;
			}

			// 2. Prepare rank data
			console.log('Preparing rank data...');
			const soloRank = formData.soloRank && formData.soloDivision ? {
				tier: formData.soloRank,
				division: formData.soloDivision,
				lp: Number(formData.soloLP) || 0,
				wins: Number(formData.soloWins) || 0,
			} : undefined;

			const flexRank = formData.flexRank && formData.flexDivision ? {
				tier: formData.flexRank,
				division: formData.flexDivision,
				lp: Number(formData.flexLP) || 0,
				wins: Number(formData.flexWins) || 0,
			} : undefined;

			// 3. Prepare account data
			console.log('Preparing account data...');
			const accountData: any = {
				title: formData.title.trim() || formData.username.trim(),
				level: formData.level ? Number(formData.level) : undefined,
				ingameName: formData.username.trim(),
				description: formData.description.trim(),
				server: undefined,
				region: formData.region || undefined,
				champCount: formData.champions ? Number(formData.champions) : undefined,
				skinCount: formData.skins ? Number(formData.skins) : undefined,
				soloRank,
				flexRank,
				loginUsername: formData.loginUsername.trim(),
				loginPassword: formData.loginPassword.trim(),
				buyPrice: forSale && formData.price ? Number(formData.price.replace(/,/g, '')) : undefined,
				rentPricePerHour: forRent && formData.rentPricePerHour ? Number(formData.rentPricePerHour.replace(/,/g, '')) : undefined,
			};

			// Only include thumbnailUrl if it's set
			if (thumbnailUrl) {
				accountData.thumbnailUrl = thumbnailUrl;
			}

			console.log('Account data prepared:', JSON.stringify(accountData, null, 2));

			// 4. Call API to create or update account
			if (isEditMode && accountId) {
				console.log('Calling updateAccount API...');
				await updateAccount(accountId, accountData);
				console.log('Account updated successfully');
				ToastAndroid.show("Cập nhật tài khoản thành công!", ToastAndroid.LONG);
			} else {
				console.log('Calling createAccount API...');
				const newAccountId = await createAccount(accountData);
				console.log('Account created successfully with ID:', newAccountId);
				
				const listingTypes = [];
				if (forSale) listingTypes.push("bán");
				if (forRent) listingTypes.push("cho thuê");
				ToastAndroid.show(`Cập nhật thành công! Tài khoản đã được cập nhật ${listingTypes.join(" và ")}`, ToastAndroid.LONG);
			}
			
			// 5. Navigate back
			console.log('Navigating back...');
			router.back();
		} catch (error: any) {
			console.error('=== ERROR IN SUBMIT ===');
			console.error('Error details:', error);
			console.error('Error message:', error?.message);
			console.error('Error stack:', error?.stack);
			const errorMessage = error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
			ToastAndroid.show(errorMessage, ToastAndroid.LONG);
		} finally {
			console.log('=== SUBMIT FINISHED ===');
			setSubmitting(false);
			setUploading(false);
		}
	};

	const rankOptions = useMemo(() => ranks.map((rank) => ({ value: rank.toLowerCase(), label: rank })), []);
	const divisionOptions = useMemo(() => divisions.map((div) => ({ value: div, label: div })), []);
	const regionOptions = useMemo(() => regions.map((region) => ({ value: region.toLowerCase(), label: region })), []);

	// Solo Rank handlers
	const handleSoloRankChange = useCallback((value: string) => {
		setFormData(prev => ({ ...prev, soloRank: value }));
	}, []);

	const handleSoloDivisionChange = useCallback((value: string) => {
		setFormData(prev => ({ ...prev, soloDivision: value }));
	}, []);

	const handleSoloLPChange = useCallback((value: string) => {
		setFormData(prev => ({ ...prev, soloLP: value }));
	}, []);

	const handleSoloWinsChange = useCallback((value: string) => {
		setFormData(prev => ({ ...prev, soloWins: value }));
	}, []);

	// Flex Rank handlers
	const handleFlexRankChange = useCallback((value: string) => {
		setFormData(prev => ({ ...prev, flexRank: value }));
	}, []);

	const handleFlexDivisionChange = useCallback((value: string) => {
		setFormData(prev => ({ ...prev, flexDivision: value }));
	}, []);

	const handleFlexLPChange = useCallback((value: string) => {
		setFormData(prev => ({ ...prev, flexLP: value }));
	}, []);

	const handleFlexWinsChange = useCallback((value: string) => {
		setFormData(prev => ({ ...prev, flexWins: value }));
	}, []);

	// TFT Rank handlers
	const handleTftRankChange = useCallback((value: string) => {
		setFormData(prev => ({ ...prev, tftRank: value }));
	}, []);

	const handleTftDivisionChange = useCallback((value: string) => {
		setFormData(prev => ({ ...prev, tftDivision: value }));
	}, []);

	const handleTftLPChange = useCallback((value: string) => {
		setFormData(prev => ({ ...prev, tftLP: value }));
	}, []);

	const handleTftWinsChange = useCallback((value: string) => {
		setFormData(prev => ({ ...prev, tftWins: value }));
	}, []);

	// Load account data when in edit mode
	useEffect(() => {
		if (accountId && accountId !== "0" && accountId !== "undefined") {
			setIsEditMode(true);
			loadAccountData();
		}
	}, [accountId]);

	const loadAccountData = async () => {
		if (accountId === undefined || accountId === null || accountId === "" || accountId === "0") {
			console.log("Invalid accountId:", accountId);
			ToastAndroid.show("ID tài khoản không hợp lệ", ToastAndroid.SHORT);
			return;
		}

		try {
			setLoading(true);
			console.log("Loading account with ID:", accountId);
			const account = await getAccountById(accountId);

			
			if (!account) {
				ToastAndroid.show("Không tìm thấy tài khoản", ToastAndroid.SHORT);
				// router.back();
				return;
			}

			// Fill form with account data
			setFormData({
				username: account.ingameName || "",
				title: account.title || "",
				level: account.level?.toString() || "",
				champions: account.champCount?.toString() || "",
				skins: account.skinCount?.toString() || "",
				blueEssence: "",
				orangeEssence: "",
				rp: "",
				honorLevel: "",
				masteryPoints: "",
				region: account.region || "",
				loginUsername: account.loginUsername || "",
				loginPassword: account.loginPassword || "",
				soloRank: account.soloRank?.tier || "",
				soloDivision: account.soloRank?.division || "",
				soloLP: account.soloRank?.lp?.toString() || "",
				soloWins: account.soloRank?.wins?.toString() || "",
				flexRank: account.flexRank?.tier || "",
				flexDivision: account.flexRank?.division || "",
				flexLP: account.flexRank?.lp?.toString() || "",
				flexWins: account.flexRank?.wins?.toString() || "",
				tftRank: "",
				tftDivision: "",
				tftLP: "",
				tftWins: "",
				price: account.buyPrice?.toString() || "",
				rentPricePerHour: account.rentPricePerHour?.toString() || "",
				description: account.description || "",
			});

			// Set image if available
			if (account.thumbnailUrl) {
				setImage(account.thumbnailUrl);
			}

			// Set sale/rent flags
			setForSale(!!account.buyPrice);
			setForRent(!!account.rentPricePerHour);
		} catch (error: any) {
			console.error("Error loading account:", error);
			ToastAndroid.show(error?.message || "Không thể tải thông tin tài khoản", ToastAndroid.SHORT);
			router.back();
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = () => {
		if (!accountId) return;

		Alert.alert(
			"Xác nhận xóa",
			"Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.",
			[
				{
					text: "Hủy",
					style: "cancel",
				},
				{
					text: "Xóa",
					style: "destructive",
					onPress: async () => {
						try {
							setDeleting(true);
							await deleteAccount(accountId);
							ToastAndroid.show("Đã xóa tài khoản thành công", ToastAndroid.SHORT);
							router.back();
						} catch (error: any) {
							console.error("Error deleting account:", error);
							ToastAndroid.show(error?.message || "Không thể xóa tài khoản", ToastAndroid.LONG);
						} finally {
							setDeleting(false);
						}
					},
				},
			]
		);
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
				<Text style={styles.title}>
					{isEditMode ? "Chỉnh sửa tài khoản" : "Đăng Bán/Thuê Tài Khoản"}
				</Text>
				{isEditMode ? (
					<TouchableOpacity
						onPress={handleDelete}
						style={styles.deleteButton}
						disabled={deleting}
					>
						{deleting ? (
							<ActivityIndicator size="small" color={colors.destructive} />
						) : (
							<Trash2 size={24} color={colors.destructive} />
						)}
					</TouchableOpacity>
				) : (
					<View style={{ width: 24 }} />
				)}
			</View>

			{loading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primary} />
					<Text style={styles.loadingText}>Đang tải thông tin...</Text>
				</View>
			) : (
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Listing Type - Checkboxes */}
				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Hình thức đăng tintin</Text>
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
					<Text style={styles.sectionLabel}>Ảnh tài khoản <Text style={styles.required}>*</Text></Text>
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
								onPress={pickImages}
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
						<Text style={styles.fieldLabel}>Tên tài khoản <Text style={styles.required}>*</Text></Text>
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

				{/* Login Credentials */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Thông tin đăng nhập</Text>

					<View style={styles.fieldGroup}>
						<Text style={styles.fieldLabel}>Tên đăng nhập <Text style={styles.required}>*</Text></Text>
						<TextInput
							style={styles.textInput}
							placeholder="Tên đăng nhập tài khoản LOL"
							placeholderTextColor={colors.mutedForeground}
							value={formData.loginUsername}
							onChangeText={(value) => setFormData({ ...formData, loginUsername: value })}
							autoCapitalize="none"
						/>
					</View>

					<View style={styles.fieldGroup}>
						<Text style={styles.fieldLabel}>Mật khẩu <Text style={styles.required}>*</Text></Text>
						<TextInput
							style={styles.textInput}
							placeholder="Mật khẩu đăng nhập"
							placeholderTextColor={colors.mutedForeground}
							value={formData.loginPassword}
							onChangeText={(value) => setFormData({ ...formData, loginPassword: value })}
							secureTextEntry
						/>
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
						rank={formData.soloRank}
						division={formData.soloDivision}
						lp={formData.soloLP}
						wins={formData.soloWins}
						rankOptions={rankOptions}
						divisionOptions={divisionOptions}
						onRankChange={handleSoloRankChange}
						onDivisionChange={handleSoloDivisionChange}
						onLPChange={handleSoloLPChange}
						onWinsChange={handleSoloWinsChange}
					/>

					<RankSelector
						label="Linh Hoạt 5v5 (Flex)"
						rank={formData.flexRank}
						division={formData.flexDivision}
						lp={formData.flexLP}
						wins={formData.flexWins}
						rankOptions={rankOptions}
						divisionOptions={divisionOptions}
						onRankChange={handleFlexRankChange}
						onDivisionChange={handleFlexDivisionChange}
						onLPChange={handleFlexLPChange}
						onWinsChange={handleFlexWinsChange}
					/>

					<RankSelector
						label="ĐTCL (TFT)"
						rank={formData.tftRank}
						division={formData.tftDivision}
						lp={formData.tftLP}
						wins={formData.tftWins}
						rankOptions={rankOptions}
						divisionOptions={divisionOptions}
						onRankChange={handleTftRankChange}
						onDivisionChange={handleTftDivisionChange}
						onLPChange={handleTftLPChange}
						onWinsChange={handleTftWinsChange}
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
					style={[styles.submitButton, (submitting || uploading) && styles.submitButtonDisabled]}
					onPress={handleSubmit}
					disabled={submitting || uploading}
				>
					{submitting || uploading ? (
						<>
							<ActivityIndicator size="small" color={colors.primaryForeground} />
							<Text style={styles.submitButtonText}>
								{uploading ? 'Đang tải ảnh...' : 'Đang cập nhật...'}
							</Text>
						</>
					) : (
						<>
							<Plus size={20} color={colors.primaryForeground} />
							<Text style={styles.submitButtonText}>Cập nhật</Text>
						</>
					)}
				</TouchableOpacity>

				{/* Bottom Spacer */}
				<View style={{ height: 40 }} />
			</ScrollView>
			)}
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
	submitButtonDisabled: {
		opacity: 0.6,
	},
	submitButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.primaryForeground,
	},
	required: {
		color: colors.destructive,
		fontSize: 14,
	},
	deleteButton: {
		padding: 8,
		borderRadius: 999,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 16,
	},
	loadingText: {
		color: colors.foreground,
		fontSize: 16,
	},
});
