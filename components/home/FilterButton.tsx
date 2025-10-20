import { colors } from "@/libs/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import type React from "react";
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	type ViewStyle,
} from "react-native";

interface FilterButtonProps {
	placeholder: string;
	onPress: () => void;
	style?: ViewStyle;
	options?: {
		value: string;
		label: string;
		icon?: React.ReactNode;
	};
}

export default function FilterButton(props: FilterButtonProps) {
	const { placeholder, onPress, style } = props;

	return (
		<TouchableOpacity style={[styles.container, style]} onPress={onPress}>
			<Text style={styles.placeholder}>{placeholder}</Text>
			<Ionicons name="chevron-down" size={20} color={colors["lol-gold"]} />
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		padding: 8,
		borderWidth: 1,
		borderColor: colors["lol-gold"],
		backgroundColor: "#000B0D",
		borderRadius: 6,
		justifyContent: "space-between",
	},
	placeholder: {
		fontSize: 14,
		color: "white",
	},
});
