import type { Item } from "@/types/items";
import React from "react";
import { StyleSheet, View } from "react-native";
import ListItem from "./ListItem";

interface ListViewProps {
	data: Item[];
	showBuyNowButton?: boolean;
	ownerIds?: Map<number, boolean>; // Map item.id to isOwner
}

export default function ListView(props: ListViewProps) {
	const { data, showBuyNowButton = true, ownerIds } = props;

	return (
		<View style={styles.list}>
			{data.map((item) => (
				<ListItem 
					key={item.id} 
					item={item} 
					showBuyNowButton={showBuyNowButton}
					isOwner={ownerIds?.get(item.id) || false}
				/>
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
