import { createUser } from "@/actions/user.action";
import Background from "@/components/Background";
import type { User } from "@/types";
import {
  type FirebaseAuthTypes,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
} from "@react-native-firebase/auth";
import { Timestamp } from "@react-native-firebase/firestore";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignIn() {
	const [initializing, setInitializing] = useState(true);

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		function handleAuthStateChanged(_user: FirebaseAuthTypes.User | null) {
			if (initializing) setInitializing(false);
		}

		const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
		return subscriber; // unsubscribe on unmount
	}, [initializing]);

	const signUp = async () => {
		// Validate inputs
		if (!username || !password || !confirmPassword) {
			ToastAndroid.show("Vui lòng điền đầy đủ thông tin", ToastAndroid.SHORT);
			return;
		}

		if (password !== confirmPassword) {
			ToastAndroid.show("Mật khẩu không khớp", ToastAndroid.SHORT);
			return;
		}

		setLoading(true);
		try {
			// 1. Tạo user trong Firebase Authentication
			const userCredential = await createUserWithEmailAndPassword(
				getAuth(),
				username,
				password
			);

			// 2. Chuẩn bị dữ liệu user với default values
			const newUserData: User = {
				uid: userCredential.user.uid,
				username: username.split("@")[0], // Lấy phần trước @ của email
				email: username,
				avatarUrl: "https://avatar.iran.liara.run/public/boy",
				role: "user",
				balance: 0,
				createdAt: Timestamp.now(),
				isActive: true,
			};

			// 3. Ghi vào Firestore (Dùng set để ID của Doc trùng với Auth UID)
			await createUser(newUserData);

			console.log("Đăng ký và tạo user database thành công!");
			ToastAndroid.show("Đăng ký thành công!", ToastAndroid.SHORT);
		} catch (error: unknown) {
			console.error(error);
			let errorMessage = "Đăng ký thất bại";
			
			if (error && typeof error === "object" && "code" in error) {
				const errorCode = (error as { code: string }).code;
				errorMessage =
					errorCode === "auth/email-already-in-use"
						? "Email đã được sử dụng"
						: errorCode === "auth/invalid-email"
							? "Email không hợp lệ"
							: errorCode === "auth/weak-password"
								? "Mật khẩu quá yếu (tối thiểu 6 ký tự)"
								: "Đăng ký thất bại";
			}
			
			ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
		} finally {
			setLoading(false);
		}
	};

	const onPress = () => {
		signUp();
	};

	if (initializing) return null;

	return (
		<View
			style={{
				flex: 1,
			}}
		>
			<Background />

			<View
				style={{
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
					paddingHorizontal: 24,
					gap: 16,
				}}
			>
				{/* Username/Email field */}
				<View
					style={{
						width: "100%",
						backgroundColor: "rgba(255, 255, 255, 0.2)",
						borderRadius: 8,
						padding: 8,
						borderColor: "#C8AA6E",
						borderWidth: 1,
					}}
				>
					<Text
						style={{
							color: "#A0ADB5",
						}}
					>
						Tên người dùng, email/số di động
					</Text>
					<TextInput
						style={styles.textInput}
						value={username}
						onChangeText={setUsername}
						placeholder="Tên người dùng, email/số di động"
					/>
				</View>

				<View
					style={{
						width: "100%",
						backgroundColor: "rgba(255, 255, 255, 0.2)",
						borderRadius: 8,
						padding: 8,
						borderColor: "#C8AA6E",
						borderWidth: 1,
					}}
				>
					<Text
						style={{
							color: "#A0ADB5",
						}}
					>
						Mật khẩu
					</Text>
					<TextInput
						style={styles.textInput}
						value={password}
						onChangeText={setPassword}
						secureTextEntry
						placeholder="Mật khẩu"
					/>
				</View>

				<View
					style={{
						width: "100%",
						backgroundColor: "rgba(255, 255, 255, 0.2)",
						borderRadius: 8,
						padding: 8,
						borderColor: "#C8AA6E",
						borderWidth: 1,
					}}
				>
					<Text
						style={{
							color: "#A0ADB5",
						}}
					>
						Nhập lại mật khẩu
					</Text>
					<TextInput
						style={styles.textInput}
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						secureTextEntry
						placeholder="Nhập lại mật khẩu"
					/>
				</View>

				{/* Login button */}

				<TouchableOpacity
					onPress={onPress}
					disabled={loading}
					style={{
						height: 56,
						width: "100%",
						backgroundColor: loading
							? "rgba(196, 170, 110, 0.3)"
							: "rgba(196, 170, 110, 0.5)",
						borderRadius: 8,
						borderColor: "#C8AA6E",
						borderWidth: 1,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Text
						style={{
							color: "#000000",
							fontSize: 16,
							fontWeight: "bold",
							textAlign: "center",
						}}
					>
						{loading ? "Đang đăng ký..." : "Đăng ký"}
					</Text>
				</TouchableOpacity>

				{/* Social login options */}
				<View
					style={{
						flexDirection: "row",
						justifyContent: "center",
						marginBottom: 32,
						gap: 16,
					}}
				>
					<TouchableOpacity
						style={{
							width: 56,
							height: 56,
							alignItems: "center",
							justifyContent: "center",
						}}
						onPress={onPress}
					>
						<Text
							style={{
								color: "#C8AA6E",
								fontSize: 48,
								fontWeight: "bold",
							}}
						>
							f
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={{
							width: 56,
							height: 56,
							alignItems: "center",
							justifyContent: "center",
						}}
						onPress={onPress}
					>
						<Text
							style={{
								color: "#C8AA6E",
								fontSize: 48,
								fontWeight: "bold",
							}}
						>
							G
						</Text>
					</TouchableOpacity>
				</View>

				{/* Create new account link */}
				<Link href="/" asChild>
					<TouchableOpacity
						style={{
							height: 56,
							width: "100%",
							backgroundColor: "transparent",
							borderColor: "#C8AA6E",
							borderWidth: 2,
							alignItems: "center",
							justifyContent: "center",
							borderRadius: 8,
						}}
					>
						<Text
							style={{
								color: "#C8AA6E",
								fontSize: 16,
								fontWeight: "bold",
								textAlign: "center",
							}}
						>
							Đã có tài khoản
						</Text>
					</TouchableOpacity>
				</Link>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	textInput: {
		width: "100%",
		height: 40,
		color: "#A0ADB5",
	},
});
