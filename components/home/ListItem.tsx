import Badge from "@/components/ui/Badge";
import { colors } from "@/libs/colors";
import type { Item } from "@/types/items";
import { Image } from "expo-image";
import { router } from 'expo-router';
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import BuyNowButton from "./BuyNowButton";

interface ListItemProps {
	item: Item;
	showBuyNowButton?: boolean;
	isOwner?: boolean;
}

export default function ListItem(props: ListItemProps) {
	const { item, showBuyNowButton = true, isOwner = false } = props;

	const formatPrice = (price: number) => {
		return price.toLocaleString("vi-VN", {
			style: "currency",
			currency: "VND",
		});
	};

	const handlePress = () => {
		router.push("/detail-acc");
	};

	const handleEditPress = () => {
		// Sử dụng firestoreId nếu có, nếu không thì dùng id (fallback)
		const editId = item.firestoreId || item.id.toString();
		if (!editId || editId === "0") {
			console.error("Invalid account ID for edit");
			return;
		}
		router.push(`/edit/${editId}`);
	};

	return (
		<View style={styles.container}>
			<View style={styles.imageContainer}>
				<Image source={props.item.image} style={styles.image} />
				{isOwner && (
					<View style={styles.badgeContainer}>
						<Badge text="Của tôi" color={colors["lol-gold"]} />
					</View>
				)}
			</View>
			<Text style={styles.username}>{props.item.name}</Text>
			<View style={styles.infoContainer}>
				<View style={styles.infoContainerLeft}>
					<Text style={styles.price}>{formatPrice(item.buyPrice || item.rentPrice)}</Text>
					<View style={styles.info}>
						<View style={styles.infoSquareContainer}>
							<View style={styles.infoSquare} />
							<Text style={styles.infoText}>Rank: {item.rank}</Text>
						</View>
						<View style={styles.infoSquareContainer}>
							<View style={styles.infoSquare} />
							<Text style={styles.infoText}>Skin: {item.skinCount}</Text>
						</View>
						<View style={styles.infoSquareContainer}>
							<View style={styles.infoSquare} />
							<Text style={styles.infoText}>Champ: {item.championCount}</Text>
						</View>
					</View>
				</View>
				{!isOwner && showBuyNowButton && <BuyNowButton onPress={handlePress} />}
				{isOwner && <BuyNowButton onPress={handleEditPress} text="SỬA" />}
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
		position: "relative",
	},
	image: {
		width: "100%",
		height: 160,
	},
	badgeContainer: {
		position: "absolute",
		top: 12,
		right: 18,
		zIndex: 1,
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
