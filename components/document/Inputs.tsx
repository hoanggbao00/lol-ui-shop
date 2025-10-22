import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import type { Item } from "@/types/items";
import SelectImage from "./SelectImage";

interface InputsProps {
	onAddItem: (item: Item) => void;
}

export default function Inputs(props: InputsProps) {
	const [name, setName] = useState("");
	const [rank, setRank] = useState("");
	const [skin, setSkin] = useState("");
	const [champ, setChamp] = useState("");
	const [price, setPrice] = useState("");
	const [image, setImage] = useState<string | undefined>(undefined);

	const handleAddItem = () => {
		if (!image || !name || !rank || !skin || !champ || !price) {
			return alert("Vui lòng điền đầy đủ thông tin");
		}

		const item: Item = {
			id: Math.random() * 1000000,
			username: name,
			price: Number.parseInt(price, 10),
			image: { uri: image },
			info: { rank: rank, skin: skin, champ: champ },
		};

		props.onAddItem(item);
	};

	return (
		<View style={styles.container}>
			<View style={[styles.item, styles.item1]}>
				<TextInput
					placeholderTextColor="white"
					placeholder="Nhập tên & id"
					style={styles.input}
					value={name}
					onChangeText={setName}
				/>
				<TextInput
					placeholderTextColor="white"
					placeholder="Nhập rank hiện tại"
					style={styles.input}
					value={rank}
					onChangeText={setRank}
				/>
				<TextInput
					placeholderTextColor="white"
					placeholder="Nhập số skin"
					style={styles.input}
					value={skin}
					onChangeText={setSkin}
				/>
				<TextInput
					placeholderTextColor="white"
					placeholder="Nhập số tướng"
					style={styles.input}
					value={champ}
					onChangeText={setChamp}
				/>
				<TextInput
					placeholderTextColor="white"
					placeholder="Nhập giá bán"
					style={styles.input}
					value={price}
					onChangeText={setPrice}
				/>
			</View>
			<SelectImage onImageSelected={setImage} image={image} onAddItem={handleAddItem} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		gap: 16,
		flexDirection: "row",
	},
	item: {
		flex: 1,
		width: "50%",
	},
	item1: {
		gap: 16,
	},
	input: {
		borderWidth: 1,
		borderColor: "#B8B8B8",
		borderRadius: 8,
		backgroundColor: "#000B0D",
		padding: 6,
		color: "white",
		textAlign: "center",
	},
});
