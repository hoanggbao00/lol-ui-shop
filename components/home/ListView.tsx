import type { Item } from "@/types/items";
import React from "react";
import { StyleSheet, View } from "react-native";
import ListItem from "./ListItem";

const screenshot = require("@/assets/images/app/screenshot.png");

const items: Item[] = [
	{
		id: 1,
		username: "Mid24#2403",
		price: 1500000,
		image: screenshot,
		info: {
			rank: "Lục bảo",
			skin: "501",
			champ: "Full",
		},
	},
	{
		id: 2,
		username: "Mid24#2403",
		price: 1500000,
		image: screenshot,
		info: {
			rank: "Lục bảo",
			skin: "501",
			champ: "Full",
		},
	},
	{
		id: 3,
		username: "Mid24#2403",
		price: 1500000,
		image: screenshot,
		info: {
			rank: "Lục bảo",
			skin: "501",
			champ: "Full",
		},
	},
];

export default function ListView() {
	return (
		<View style={styles.list}>
			{items.map((item) => (
				<ListItem key={item.id} item={item} />
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	list: {
		gap: 8,
		paddingBottom: 100,
    paddingHorizontal: 16,
	},
});
