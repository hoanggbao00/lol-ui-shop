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

	const priceOptions = [
		{ value: "100000-200000", label: "100,000 - 200,000" },
		{ value: "200000-300000", label: "200,000 - 300,000" },
		{ value: "300000-400000", label: "300,000 - 400,000" },
		{ value: "400000-500000", label: "400,000 - 500,000" },
		{ value: "500000-600000", label: "500,000 - 600,000" },
	];

	const skinOptions = [
		{ value: "Sử thi", label: "Sử thi" },
		{ value: "Vàng", label: "Vàng" },
		{ value: "Hiếm", label: "Hiếm" },
		{ value: "Bạc", label: "Bạc" },
		{ value: "Đỏ", label: "Đỏ" },
		{ value: "Xanh", label: "Xanh" },
	];

	const levelOptions = [
		{ value: "100-200", label: "100-200" },
		{ value: "200-300", label: "200-300" },
		{ value: "300-400", label: "300-400" },
		{ value: "400-500", label: "400-500" },
		{ value: ">500", label: "Trên 500" },
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
					options={priceOptions}
					selectedValue={price}
					onSelectValue={setPrice}
				/>
			</View>
			<View style={styles.container}>
				<FilterButton
					placeholder="Tìm theo trang phục"
					style={styles.filterButton}	
					options={skinOptions}
					selectedValue={skin}
					onSelectValue={setSkin}
				/>
				<FilterButton
					placeholder="Tìm theo level"
					style={styles.filterButton}
					options={levelOptions}
					selectedValue={level}
					onSelectValue={setLevel}
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
