import Background from "@/components/Background";
import Filter from "@/components/home/Filter";
import ListView from "@/components/home/ListView";
import { Image } from "expo-image";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";

const icons = {
	cart: require("@/assets/icons/cart.png"),
};

export default function Index() {
	return (
		<ScrollView style={styles.scrollView}>
			<StatusBar barStyle="light-content" />

			<View style={styles.container}>
				<Background />
				<View style={styles.header}>
					<Image source={icons.cart} style={styles.icon} />
				</View>
				<Filter />
				<ListView />
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
