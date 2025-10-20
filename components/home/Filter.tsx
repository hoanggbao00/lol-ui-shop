import React from "react";
import { StyleSheet, View } from "react-native";
import FilterButton from "./FilterButton";

export default function Filter() {
	return (
		<View>
			<View style={styles.container}>
				<FilterButton
					placeholder="Tìm theo rank"
					onPress={() => {}}
					style={styles.filterButton}
				/>
				<FilterButton
					placeholder="Tìm theo giá"
					onPress={() => {}}
					style={styles.filterButton}
				/>
			</View>
			<View style={styles.container}>
				<FilterButton
					placeholder="Tìm theo trang phục"
					onPress={() => {}}
					style={styles.filterButton}
				/>
				<FilterButton
					placeholder="Tìm theo skin"
					onPress={() => {}}
					style={styles.filterButton}
				/>
			</View>
      <View style={styles.container}>
				<FilterButton
					placeholder="Tìm theo bậc"
					onPress={() => {}}
					style={styles.filterButton}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		gap: 16,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	filterButton: {
    width: "50%",
	},
});
