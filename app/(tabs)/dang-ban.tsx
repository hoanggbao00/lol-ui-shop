import Background from "@/components/Background";
import ListView from "@/components/home/ListView";
import { colors } from '@/libs/colors';
import { mockData } from "@/libs/mock-data";
import type { Item } from "@/types/items";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const icons = {
	cart: require("@/assets/icons/cart.png"),
};

export default function DangBan() {
	const [data, setData] = useState<Item[]>(mockData);

	const handleNavigateToCart = () => {
		router.push("/cart");
	};

	return (
		<View style={styles.container}>
			<Background />
			<StatusBar barStyle="light-content" />
			<ScrollView style={styles.scrollView}>
				<View>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.push("/new")}>
							<Ionicons name="add-circle" size={32} color={colors["lol-gold"]} />
						</TouchableOpacity>
						<TouchableOpacity onPress={handleNavigateToCart}>
							<Image source={icons.cart} style={styles.icon} />
						</TouchableOpacity>
					</View>

					<View>
						<View style={listViewStyles.dividerContainer}>
							<View style={listViewStyles.divider} />
							<Text style={listViewStyles.dividerText}>Bài đã đăng</Text>
							<View style={listViewStyles.divider} />
						</View>
						<ListView data={data} />
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	container: {
		flex: 1,
		paddingTop: 24,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
	},
	icon: {
		width: 36,
		height: 36,
	},
});

const listViewStyles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 16,
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		padding: 16,
	},
	divider: {
		height: 1,
		backgroundColor: "#9F9168",
		flex: 1,
	},
	dividerText: {
		color: "#CABB8E",
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "center",
	},
});
