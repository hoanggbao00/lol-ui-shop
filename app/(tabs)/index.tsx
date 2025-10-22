import Background from "@/components/Background";
import Filter from "@/components/home/Filter";
import ListView from "@/components/home/ListView";
import { mockData } from "@/libs/mock-data";
import type { Item } from "@/types/items";
import { Image } from "expo-image";
import { router } from 'expo-router';
import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";

const icons = {
	cart: require("@/assets/icons/cart.png"),
};

export default function Index() {
	const [data, setData] = useState<Item[]>(mockData);

	const handleNavigateToCart = () => {
		router.push("/cart");
	};

	return (
		<ScrollView style={styles.scrollView}>
			<StatusBar barStyle="light-content" />

			<View style={styles.container}>
				<Background />
				<View style={styles.header}>
					<TouchableOpacity onPress={handleNavigateToCart}>
						<Image source={icons.cart} style={styles.icon} />
					</TouchableOpacity>
				</View>
				<Filter />
				<ListView data={data} />
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	container: {
		flex: 1,
		position: "relative",
		gap: 24,
		paddingTop: 24,
	},
	header: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
		padding: 16,
	},
	icon: {
		width: 36,
		height: 36,
	},
});
