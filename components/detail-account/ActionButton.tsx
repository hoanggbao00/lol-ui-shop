import { colors } from "@/libs/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ActionButtonProps {
	onPress: () => void;
	icon: keyof typeof Ionicons.glyphMap;
	title: string;
	text: string;
  iconColor?: string;
  textColor?: string;
  backgroundColor?: string;
}

export default function ActionButton(props: ActionButtonProps) {
	return (
		<TouchableOpacity
			onPress={props.onPress}
			style={{
				backgroundColor: props.backgroundColor || colors["lol-dark-blue"],
				padding: 8,
				borderRadius: 16,
				alignItems: "center",
				flex: 1,
				justifyContent: "center",
				flexDirection: "row",
				gap: 8,
			}}
		>
			<Ionicons name={props.icon} size={24} color={props.iconColor || "white"} />
			<View>
				<Text style={{ fontSize: 14, color: props.textColor || "white" }}>{props.title}</Text>
				<Text style={{ fontSize: 12, color: props.textColor || "white" }}>
					{props.text}
				</Text>
			</View>
		</TouchableOpacity>
	);
}
