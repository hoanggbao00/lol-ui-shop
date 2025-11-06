import Background from "@/components/Background";
import AccountImageName from "@/components/detail-account/AccountImageName";
import AccountListItem from "@/components/detail-account/AccountListItem";
import DetailActions from "@/components/detail-account/DetailActions";
import SkinNoiBat from "@/components/detail-account/SkinNoiBat";
import TinhHoaLamInfo from "@/components/detail-account/TinhHoaLamInfo";
import { colors } from "@/libs/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const screenshot = require("@/assets/images/app/screenshot.png");

const item = {
	id: 1,
	username: "Mid24#2403",
	price: 1500000,
	image: screenshot,
	info: {
		rank: "Lục bảo",
		skin: "501",
		champ: "Full",
	},
};

export default function DetailAcc() {
	return (
		<View style={styles.container}>
			<Background />
			<ScrollView style={styles.scrollView}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()}>
						<Ionicons name="arrow-back" size={24} color="white" />
					</TouchableOpacity>
					<Text style={styles.title}>Chi tiết tài khoản</Text>
				</View>

				<View
					style={{
						flex: 1,
						padding: 8,
					}}
				>
					<AccountImageName
						image={item.image}
						username={item.username}
						description="Premium account with exclusive skins and champions."
					/>

					<View
						style={{
							gap: 16,
						}}
					>
						<AccountListItem />

						<TinhHoaLamInfo />

						<SkinNoiBat />
					</View>
					<DetailActions />
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors["lol-black"],
	},
	scrollView: {
		paddingTop: 64,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		gap: 16,
	},
	backButton: {
		fontSize: 20,
		fontWeight: "bold",
		color: "white",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		color: "white",
	},
});
