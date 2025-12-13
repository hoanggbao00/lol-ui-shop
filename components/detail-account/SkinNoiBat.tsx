import { colors } from "@/libs/colors";
import React from "react";
import { View } from "react-native";
import Badge from '../ui/Badge';
import { Text } from '../ui/Text';

export default function SkinNoiBat() {
	return (
		<View
			style={{
				padding: 16,
				backgroundColor: colors["card"],
				borderRadius: 16,
				borderWidth: 1,
				borderColor: colors["primary"],
        gap: 16,
			}}
		>
			<Text
				style={{
					fontSize: 16,
					fontFamily: "Inter_700Bold",
				}}
			>
				Skin Nổi Bật
			</Text>
      <View style={{ gap: 8, flexDirection: "row", flexWrap: "wrap" }}>
        <Badge text="Elementalist Lux" color='gold' />
        <Badge text="K/DA ALL OUT Ahri" color={colors['void']} />
        <Badge text="PROJECT: Yasuo" color={colors['lol-blue']} />
        <Badge text="SUNSET Jhin" color={colors['lol-gold']} />
        <Badge text="CHAMPION: Yone" color={colors['lol-blue']} />
        <Badge text="SUNSET Jhin" color={colors['lol-gold']} />
      </View>
		</View>
	);
}
