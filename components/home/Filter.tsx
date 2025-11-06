import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import FilterButton from "./FilterButton";

export default function Filter() {
	const [rank, setRank] = useState("");
	const [price, setPrice] = useState("");
	const [skin, setSkin] = useState("");
	const [champ, setChamp] = useState("");
	const [level, setLevel] = useState("");

	const rankOptions = [
		{ value: "cao-thu", label: "Cao thủ" },
		{ value: "bac-kim", label: "Bạch Kim" },
		{ value: "vang", label: "Vàng" },
		{ value: "bach-kim", label: "Bạch Kim" },
		{ value: "xanh", label: "Xanh" },
		{ value: "luc-bao", label: "Lục bảo" },
		{ value: "bac-bao", label: "Bạc bảo" },
		{ value: "vang-bao", label: "Vàng bảo" },
		{ value: "do-bao", label: "Đỏ bảo" },
		{ value: "xanh-bao", label: "Xanh bảo" },
	];

	return (
		<View>
			<View style={styles.container}>
				<FilterButton
					placeholder="Tìm theo rank"
					style={styles.filterButton}
					options={rankOptions}
					selectedValue={rank}
					onSelectValue={setRank}
				/>
				<FilterButton
					placeholder="Tìm theo giá"
					style={styles.filterButton}
				/>
			</View>
			<View style={styles.container}>
				<FilterButton
					placeholder="Tìm theo trang phục"
					style={styles.filterButton}
				/>
				<FilterButton
					placeholder="Tìm theo skin"
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
