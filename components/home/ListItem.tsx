import { colors } from "@/libs/colors";
import type { Item } from "@/types/items";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import BuyNowButton from "./BuyNowButton";

interface ListItemProps {
	item: Item;
}

export default function ListItem(props: ListItemProps) {
	const { item } = props;

	const formatPrice = (price: number) => {
		return price.toLocaleString("vi-VN", {
			style: "currency",
			currency: "VND",
		});
	};
	return (
		<View style={styles.container}>
			<View style={styles.imageContainer}>
				<Image source={props.item.image} style={styles.image} />
			</View>
			<Text style={styles.username}>{props.item.username}</Text>
			<View style={styles.infoContainer}>
				<View style={styles.infoContainerLeft}>
					<Text style={styles.price}>{formatPrice(item.price)}</Text>
					<View style={styles.info}>
						<View style={styles.infoSquareContainer}>
							<View style={styles.infoSquare} />
							<Text style={styles.infoText}>Rank: {item.info.rank}</Text>
						</View>
						<View style={styles.infoSquareContainer}>
							<View style={styles.infoSquare} />
							<Text style={styles.infoText}>Skin: {item.info.skin}</Text>
						</View>
						<View style={styles.infoSquareContainer}>
							<View style={styles.infoSquare} />
							<Text style={styles.infoText}>Champ: {item.info.champ}</Text>
						</View>
					</View>
				</View>
				<BuyNowButton />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		gap: 10,
		borderWidth: 1,
		borderColor: colors["lol-gold"],
		backgroundColor: "#012026",
		flex: 1,
	},
	imageContainer: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		width: "100%",
	},
	image: {
		width: "100%",
		height: 160,
	},
	username: {
		color: "#02AFAC",
		fontSize: 16,
		fontWeight: "bold",
		borderWidth: 1,
		borderStartWidth: 0,
		borderEndWidth: 0,
		borderColor: colors["lol-gold"],
		backgroundColor: "black",
		width: "100%",
		padding: 8,
	},
	infoContainer: {
		flexDirection: "row",
		alignItems: "flex-end",
		justifyContent: "space-between",
		width: "100%",
		padding: 8,
	},
  infoContainerLeft: {
    flex: 1,
    gap: 8,
  },
	price: {
		color: "yellow",
		fontSize: 20,
		fontWeight: "bold",
		textAlign: "left",
		width: "100%",
	},
	info: {
		flex: 1,
		gap: 4,
	},
	infoSquareContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	infoSquare: {
		width: 10,
		height: 10,
		backgroundColor: "#045160",
	},
	infoText: {
		color: "#fff",
		fontSize: 12,
	},
});
