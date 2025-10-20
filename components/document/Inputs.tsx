import React from "react";
import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import SelectImage from './SelectImage';

export default function Inputs() {
	return (
		<View style={styles.container}>
			<View style={[styles.item, styles.item1]}>
				<TextInput placeholderTextColor='white' placeholder="Nhập tên & id" style={styles.input} />
				<TextInput placeholderTextColor='white' placeholder="Nhập rank hiện tại" style={styles.input} />
				<TextInput placeholderTextColor='white' placeholder="Nhập số skin" style={styles.input} />
				<TextInput placeholderTextColor='white' placeholder="Nhập số tướng" style={styles.input} />
				<TextInput placeholderTextColor='white' placeholder="Nhập giá bán" style={styles.input} />
			</View>
			<SelectImage />
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
    textAlign: 'center',
	},
});
