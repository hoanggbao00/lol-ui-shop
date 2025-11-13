import Background from "@/components/Background";
import { colors } from "@/libs/colors";
import { getAuth, onAuthStateChanged, signOut } from '@react-native-firebase/auth';
import { Image } from "expo-image";
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";

const icons = {
	Frame: require("../../assets/icons/settings/frame.png"),
	Profile: require("../../assets/icons/settings/profile.png"),
	Password: require("../../assets/icons/settings/password.png"),
	History: require("../../assets/icons/settings/history.png"),
	Export: require("../../assets/icons/settings/export.png"),
	Wallet: require("../../assets/icons/settings/wallet.png"),
	Language: require("../../assets/icons/settings/language.png"),
	Logout: require("../../assets/icons/settings/logout.png"),
};

export default function User() {
	const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(); 

	function handleAuthStateChanged(_user: any) {
    setUser(_user);
    if (initializing) setInitializing(false);
  }

	useEffect(() => {
		const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
		return subscriber;
	}, []);

	const handleLogout = async () => {
		await signOut(getAuth());
		ToastAndroid.show("Đăng xuất thành công", ToastAndroid.SHORT);
		router.push("/");
	}

	if (initializing) return null;

	const menus = [
		{
			icon: icons.Profile,
			text: "Thông tin cá nhân",
		},
		{
			icon: icons.Password,
			text: "Đổi mật khẩu",
		},
		{
			icon: icons.History,
			text: "Lịch sử giao dịch",
		},
		{
			icon: icons.Export,
			text: "Đăng, bán tài khoản",
		},
		{
			icon: icons.Wallet,
			text: "Liên kết ngân hàng",
		},
		{
			icon: icons.Language,
			text: "Đổi ngôn ngữ",
		},
		{
			icon: icons.Logout,
			text: "Đăng xuất",
			onPress: () => {
				handleLogout();
			},
		},
	];

	return (
			<View
				style={{
					flex: 1,
					backgroundColor: colors["lol-black"],
					position: "relative",
				}}
			>
				<Background />
				<ScrollView
					style={{
						gap: 24,
						padding: 24,
					}}
				>
					<Image source={icons.Frame} style={styles.frame} />
					<Text style={styles.name}>Tên: Nam Nguyen</Text>
					<Text style={styles.name}>ID: 12</Text>
					<View style={styles.cardContainer}>
						{menus.map((item, index) => (
							<TouchableOpacity onPress={item.onPress} style={styles.cardItem} key={item.text}>
								<Image source={item.icon} style={styles.icon} />
								<Text style={styles.cardText}>{item.text}</Text>
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>
			</View>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	frame: {
		width: 180,
		height: 180,
		marginHorizontal: "auto",
		marginTop: 40,
	},
	name: {
		color: colors["lol-gold"],
		fontSize: 20,
		fontWeight: "bold",
		textAlign: "center",
	},
	cardContainer: {
		backgroundColor: "#ffffff30",
		borderWidth: 1,
		borderColor: colors["lol-gold"],
		padding: 20,
		gap: 20,
		borderRadius: 20,
	},
	cardItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	icon: {
		width: 36,
		height: 36,
	},
	cardText: {
		color: colors["lol-gold"],
		fontSize: 20,
		textAlign: "center",
	},
});
