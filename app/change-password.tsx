import { updatePassword } from "@/actions/user.action";
import Background from "@/components/Background";
import { colors } from "@/libs/colors";
import { router } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Lock, Save } from "lucide-react-native";
import { useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	ToastAndroid,
	TouchableOpacity,
	View,
} from "react-native";

interface PasswordFieldProps {
	icon: React.ComponentType<{ size?: number; color?: string }>;
	label: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
}

const PasswordField = ({
	icon: Icon,
	label,
	value,
	onChangeText,
	placeholder,
}: PasswordFieldProps) => {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<View style={styles.fieldContainer}>
			<View style={styles.iconContainer}>
				<Icon size={20} color={colors.primary} />
			</View>
			<View style={styles.inputWrapper}>
				<Text style={styles.label}>{label}</Text>
				<View style={styles.passwordInputContainer}>
					<TextInput
						value={value}
						onChangeText={onChangeText}
						placeholder={placeholder || label}
						placeholderTextColor={colors.mutedForeground}
						secureTextEntry={!showPassword}
						style={styles.input}
					/>
					<TouchableOpacity
						onPress={() => setShowPassword(!showPassword)}
						style={styles.eyeButton}
					>
						{showPassword ? (
							<EyeOff size={20} color={colors.mutedForeground} />
						) : (
							<Eye size={20} color={colors.mutedForeground} />
						)}
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

export default function ChangePasswordScreen() {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChangePassword = async () => {
		// Validation
		if (!currentPassword || !newPassword || !confirmPassword) {
			ToastAndroid.show(
				"Vui lòng điền đầy đủ thông tin",
				ToastAndroid.SHORT
			);
			return;
		}

		if (newPassword.length < 6) {
			ToastAndroid.show(
				"Mật khẩu mới phải có ít nhất 6 ký tự",
				ToastAndroid.SHORT
			);
			return;
		}

		if (newPassword !== confirmPassword) {
			ToastAndroid.show("Mật khẩu xác nhận không khớp", ToastAndroid.SHORT);
			return;
		}

		if (currentPassword === newPassword) {
			ToastAndroid.show(
				"Mật khẩu mới phải khác mật khẩu hiện tại",
				ToastAndroid.SHORT
			);
			return;
		}

		setLoading(true);

		try {
			// Use action to update password
			await updatePassword(currentPassword, newPassword);

			ToastAndroid.show("Đổi mật khẩu thành công", ToastAndroid.LONG);
			
			// Clear fields
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			
			// Navigate back after a short delay
			setTimeout(() => {
				router.back();
			}, 1000);
		} catch (error: any) {
			console.error("Change password error:", error);
			
			let errorMessage = "Đổi mật khẩu thất bại";
			if (error.message) {
				errorMessage = error.message;
			} else if (error.code === "auth/wrong-password") {
				errorMessage = "Mật khẩu hiện tại không đúng";
			} else if (error.code === "auth/weak-password") {
				errorMessage = "Mật khẩu mới quá yếu";
			} else if (error.code === "auth/requires-recent-login") {
				errorMessage = "Vui lòng đăng nhập lại để đổi mật khẩu";
			}
			
			ToastAndroid.show(errorMessage, ToastAndroid.LONG);
		} finally {
			setLoading(false);
		}
	};

	const hasChanges =
		currentPassword !== "" || newPassword !== "" || confirmPassword !== "";

	return (
		<View style={styles.container}>
			<Background />

			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
					<ArrowLeft size={20} color={colors.foreground} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Đổi mật khẩu</Text>
				<View style={{ width: 40 }} />
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Info Card */}
				<View style={styles.infoCard}>
					<Lock size={24} color={colors.primary} />
					<Text style={styles.infoText}>
						Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh có ít nhất 6 ký
						tự
					</Text>
				</View>

				{/* Password Fields */}
				<View style={styles.fieldsContainer}>
					<PasswordField
						icon={Lock}
						label="Mật khẩu hiện tại"
						value={currentPassword}
						onChangeText={setCurrentPassword}
						placeholder="Nhập mật khẩu hiện tại"
					/>
					<PasswordField
						icon={Lock}
						label="Mật khẩu mới"
						value={newPassword}
						onChangeText={setNewPassword}
						placeholder="Nhập mật khẩu mới"
					/>
					<PasswordField
						icon={Lock}
						label="Xác nhận mật khẩu mới"
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						placeholder="Nhập lại mật khẩu mới"
					/>
				</View>

				{/* Save Button */}
				<TouchableOpacity
					onPress={handleChangePassword}
					disabled={!hasChanges || loading}
					style={[
						styles.saveButton,
						{
							backgroundColor: hasChanges && !loading ? colors.primary : colors.muted,
							opacity: hasChanges && !loading ? 1 : 0.5,
						},
					]}
				>
					{loading ? (
						<ActivityIndicator size="small" color={colors.primaryForeground} />
					) : (
						<Save size={20} color={hasChanges ? colors.primaryForeground : colors.mutedForeground} />
					)}
					<Text
						style={[
							styles.saveButtonText,
							{
								color: hasChanges ? colors.primaryForeground : colors.mutedForeground,
							},
						]}
					>
						{loading ? "Đang xử lý..." : "Đổi mật khẩu"}
					</Text>
				</TouchableOpacity>
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
		fontFamily: "Inter_600SemiBold",
		color: colors.foreground,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
		gap: 24,
	},
	infoCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		padding: 16,
		backgroundColor: `${colors.primary}1A`,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: `${colors.primary}33`,
	},
	infoText: {
		flex: 1,
		fontSize: 14,
		color: colors.foreground,
		lineHeight: 20,
	},
	fieldsContainer: {
		gap: 16,
	},
	fieldContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		backgroundColor: `${colors.card}80`,
		borderColor: `${colors.border}4D`,
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: `${colors.primary}33`,
		alignItems: "center",
		justifyContent: "center",
	},
	inputWrapper: {
		flex: 1,
	},
	label: {
		fontSize: 12,
		color: colors.mutedForeground,
		marginBottom: 4,
	},
	passwordInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	input: {
		flex: 1,
		fontSize: 16,
		fontFamily: "Inter_500Medium",
		color: colors.foreground,
		padding: 0,
	},
	eyeButton: {
		padding: 4,
	},
	saveButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		padding: 16,
		borderRadius: 12,
		marginTop: 8,
	},
	saveButtonText: {
		fontSize: 16,
		fontFamily: "Inter_600SemiBold",
	},
});
