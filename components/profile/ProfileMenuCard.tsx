import { colors } from "@/libs/colors";
import { getAuth } from "@react-native-firebase/auth";
import { router } from "expo-router";
import {
	Database,
	History,
	Lock,
	LogOut,
	Receipt,
	Upload,
	User,
	Users
} from "lucide-react-native";
import type React from "react";
import { Text, ToastAndroid, TouchableOpacity, View } from "react-native";

interface MenuItem {
	icon: React.ComponentType<{ size?: number; color?: string }>;
	text: string;
	onPress?: () => void;
}

interface ProfileMenuCardProps {
	isAdmin?: boolean;
}

export default function ProfileMenuCard({ isAdmin = false }: ProfileMenuCardProps) {
	const handleLogout = async () => {
		await getAuth().signOut();
		ToastAndroid.show("Đăng xuất thành công", ToastAndroid.SHORT);
		router.push("/");
	};

	const adminMenus: MenuItem[] = [
		{
			icon: Users,
			text: "Quản lý user",
			onPress: () => {
				router.push("/quan-ly-user");
			},
		},
		{
			icon: Receipt,
			text: "Quản lý giao dịch",
			onPress: () => {
				router.push("/quan-ly-giao-dich");
			},
		},
		{
			icon: Database,
			text: "Quản lý tài khoản",
			onPress: () => {
				router.push("/quan-ly-tai-khoan");
			},
		},
	];

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
			icon: Receipt,
			text: "Giao dịch của tôi",
			onPress: () => {
				router.push("/quan-ly-giao-dich");
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
				router.push("/new");
			},
		},
		{
			icon: LogOut,
			text: "Đăng xuất",
			onPress: handleLogout,
		},
	];

	// Combine admin menus with regular menus
	const allMenus = isAdmin ? [...adminMenus, ...menus] : menus;

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
			{allMenus.map((item, index) => {
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
									fontFamily: "Inter_500Medium",
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
