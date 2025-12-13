import Badge from "@/components/ui/Badge";
import { colors } from "@/libs/colors";
import type { Item } from "@/types/items";
import { Image } from "expo-image";
import { router } from 'expo-router';
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BuyNowButton from "./BuyNowButton";

interface ListItemProps {
	item: Item;
	showBuyNowButton?: boolean;
	isOwner?: boolean;
	showBuyerInfo?: boolean; // Show buyer info in dang-ban page
}

export default function ListItem(props: ListItemProps) {
	const { item, showBuyNowButton = true, isOwner = false, showBuyerInfo = false } = props;

	const formatPrice = (price: number) => {
		return price.toLocaleString("vi-VN", {
			style: "currency",
			currency: "VND",
		});
	};

	const handleCardPress = () => {
		// Sử dụng firestoreId nếu có, nếu không thì dùng id (fallback)
		const accountId = item.firestoreId || item.id.toString();
		if (!accountId || accountId === "0") {
			console.error("Invalid account ID for detail view");
			return;
		}
		router.push(`/detail-acc/${accountId}`);
	};

	const handlePress = () => {
		// Navigate to detail page when BuyNowButton is pressed
		handleCardPress();
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
		<TouchableOpacity 
			style={styles.container} 
			onPress={handleCardPress}
			activeOpacity={0.8}
		>
			<View style={styles.imageContainer}>
				<Image source={props.item.image} style={styles.image} />
				{isOwner && (
					<View style={styles.badgeContainer}>
						<Badge text="Của tôi" color={colors["lol-gold"]} />
					</View>
				)}
			</View>
			<Text style={styles.username}>{props.item.name}</Text>
			{showBuyerInfo && item.buyerInfo && (
				<View style={styles.buyerInfoContainer}>
					<Text style={styles.buyerInfoLabel}>
						{item.buyerInfo.transactionType === "purchase" ? "Đã bán cho" : "Đang thuê bởi"}:
					</Text>
					<Text style={styles.buyerInfoText}>{item.buyerInfo.buyerName || "Unknown"}</Text>
					{item.buyerInfo.transactionType === "rent" && item.buyerInfo.rentEndDate && (
						<Text style={styles.rentEndDate}>
							Hết hạn: {item.buyerInfo.rentEndDate.toLocaleDateString("vi-VN")} {item.buyerInfo.rentEndDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
						</Text>
					)}
				</View>
			)}
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
				<View style={styles.buttonContainer}>
					{!isOwner && showBuyNowButton && (
						<TouchableOpacity 
							onPress={(e) => {
								e.stopPropagation();
								handlePress();
							}}
							activeOpacity={0.7}
						>
							<BuyNowButton onPress={handlePress} />
						</TouchableOpacity>
					)}
					{isOwner && item.status !== "sold" && (
						<TouchableOpacity 
							onPress={(e) => {
								e.stopPropagation();
								handleEditPress();
							}}
							activeOpacity={0.7}
						>
							<BuyNowButton onPress={handleEditPress} text="SỬA" />
						</TouchableOpacity>
					)}
				</View>
			</View>
		</TouchableOpacity>
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
	},
	username: {
		color: "#02AFAC",
		fontSize: 16,
		fontFamily: "Inter_700Bold",
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
	buttonContainer: {
		// Container for buttons to prevent event bubbling
	},
	price: {
		color: "yellow",
		fontSize: 20,
		fontFamily: "Inter_700Bold",
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
	buyerInfoContainer: {
		width: "100%",
		paddingHorizontal: 8,
		paddingVertical: 8,
		backgroundColor: "rgba(202, 187, 142, 0.1)",
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: colors["lol-gold"],
		gap: 4,
	},
	buyerInfoLabel: {
		color: colors["lol-gold"],
		fontSize: 12,
		fontFamily: "Inter_600SemiBold",
	},
	buyerInfoText: {
		color: "#fff",
		fontSize: 14,
		fontFamily: "Inter_700Bold",
	},
	rentEndDate: {
		color: "#CABB8E",
		fontSize: 11,
		fontStyle: "italic",
	},
});
