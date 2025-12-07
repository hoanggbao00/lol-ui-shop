import { colors } from "@/libs/colors";
import { getAuth } from "@react-native-firebase/auth";
import { router } from "expo-router";
import {
	History,
	Languages,
	Lock,
	LogOut,
	Upload,
	User,
} from "lucide-react-native";
import type React from "react";
import { Text, ToastAndroid, TouchableOpacity, View } from "react-native";

interface MenuItem {
	icon: React.ComponentType<{ size?: number; color?: string }>;
	text: string;
	onPress?: () => void;
}

export default function ProfileMenuCard() {
	const handleLogout = async () => {
		await getAuth().signOut();
		ToastAndroid.show("Đăng xuất thành công", ToastAndroid.SHORT);
		router.push("/");
	};

	const menus: MenuItem[] = [
		{
			icon: User,
			text: "Thông tin cá nhân",
			onPress: () => {
				router.push("/profile");
			},
		},
		{
			icon: Lock,
			text: "Đổi mật khẩu",
			onPress: () => {
				router.push("/change-password");
			},
		},
		{
			icon: History,
			text: "Lịch sử giao dịch",
			onPress: () => {
				router.push("/cart");
			},
		},
		{
			icon: Upload,
			text: "Đăng, bán tài khoản",
			onPress: () => {
				// TODO: Implement sell account
			},
		},
		{
			icon: Languages,
			text: "Đổi ngôn ngữ",
			onPress: () => {
				// TODO: Implement language change
			},
		},
		{
			icon: LogOut,
			text: "Đăng xuất",
			onPress: handleLogout,
		},
	];

	return (
		<View
			style={{
				marginHorizontal: 16,
				backgroundColor: `${colors.card}80`,
				borderRadius: 16,
				borderWidth: 1,
				borderColor: `${colors.border}4D`,
				padding: 8,
				gap: 4,
			}}
		>
			{menus.map((item, index) => {
				const Icon = item.icon;
				const isLast = index === menus.length - 1;
				const isLogout = item.text === "Đăng xuất";

				return (
					<View key={item.text}>
						<TouchableOpacity
							onPress={item.onPress}
							style={{
								flexDirection: "row",
								alignItems: "center",
								gap: 16,
								padding: 16,
								borderRadius: 12,
								backgroundColor: isLogout
									? `${colors.destructive}1A`
									: "transparent",
							}}
							activeOpacity={0.7}
						>
							<View
								style={{
									width: 40,
									height: 40,
									borderRadius: 20,
									backgroundColor: isLogout
										? `${colors.destructive}33`
										: `${colors.primary}1A`,
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Icon
									size={20}
									color={isLogout ? colors.destructive : colors.primary}
								/>
							</View>
							<Text
								style={{
									flex: 1,
									fontSize: 16,
									fontWeight: "500",
									color: isLogout ? colors.destructive : colors.foreground,
								}}
							>
								{item.text}
							</Text>
						</TouchableOpacity>
						{!isLast && (
							<View
								style={{
									height: 1,
									backgroundColor: `${colors.border}33`,
									marginLeft: 72,
								}}
							/>
						)}
					</View>
				);
			})}
		</View>
	);
}
