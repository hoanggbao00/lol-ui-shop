import Background from "@/components/Background";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";

export default function SignIn() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(); 

	function handleAuthStateChanged(_user: any) {
    setUser(_user);
    if (initializing) setInitializing(false);
  }

	const signIn = async () => {
		setLoading(true);
		try {
			await signInWithEmailAndPassword(getAuth(), username, password);
		} catch (error) {
			console.error(error);
			ToastAndroid.show('Error', ToastAndroid.SHORT);
		} finally {
			setLoading(false);
		}
	}

	const onPress = () => {
		signIn();
	};

	useEffect(() => {
		if (user) {
			router.push("/(tabs)/home");
			ToastAndroid.show('Đăng nhập thành công', ToastAndroid.SHORT);
		}
	}, [user])

	useEffect(() => {
		const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
		return subscriber; // unsubscribe on unmount
	}, []);

	return (
		<View
			style={{
				flex: 1,
				position: "relative",
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
						Email
					</Text>
					<TextInput
						style={{
							width: "100%",
							height: 40,
						}}
						value={username}
						onChangeText={setUsername}
						placeholder="Email"
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
						style={{
							width: "100%",
							height: 40,
						}}
						value={password}
						onChangeText={setPassword}
						secureTextEntry
						placeholder="Mật khẩu"
					/>
				</View>

				{/* Login button */}

				<TouchableOpacity
					onPress={onPress}
					style={{
						height: 56,
						width: "100%",
						backgroundColor: "rgba(196, 170, 110, 0.5)",
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
							fontFamily: "Inter_700Bold",
							textAlign: "center",
						}}
					>
						Đăng nhập
					</Text>
				</TouchableOpacity>

				{/* Forgot password link */}
				<TouchableOpacity
					style={{
						marginBottom: 32,
					}}
				>
					<Text
						style={{
							color: "#FFF3E5",
							fontSize: 16,
							fontFamily: "Inter_700Bold",
						}}
					>
						Quên mật khẩu?
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
								fontFamily: "Inter_700Bold",
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
								fontFamily: "Inter_700Bold",
							}}
						>
							G
						</Text>
					</TouchableOpacity>
				</View>

				{/* Create new account link */}
				<Link href="/signup" asChild>
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
								fontFamily: "Inter_700Bold",
								textAlign: "center",
							}}
						>
							Tạo tài khoản mới
						</Text>
					</TouchableOpacity>
				</Link>
			</View>
		</View>
	);
}
