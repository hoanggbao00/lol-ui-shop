import { colors } from "@/libs/colors";
import React from "react";
import { View } from "react-native";
import Badge from '../ui/Badge';
import { Text } from "../ui/Text";

export default function TinhHoaLamInfo() {
	return (
		<View
			style={{
				padding: 16,
				backgroundColor: colors["card"],
				borderRadius: 16,
				borderWidth: 1,
				borderColor: colors["primary"],
        gap: 8,
			}}
		>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					borderBottomWidth: 1,
					borderColor: colors["cardForeground"],
					paddingBottom: 8,
				}}
			>
				<Text>Tinh Hoa Lam</Text>
				<Badge text="45230" color="blue" type="number" />
			</View>

			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Text>Riot Points</Text>
				<Badge text="1350" color="gold" type="number" />
			</View>
		</View>
	);
}
