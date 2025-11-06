import { colors } from "@/libs/colors";
import { formatNumber } from "@/libs/format";
import React, { useMemo } from "react";
import { Text, type TextStyle } from "react-native";

interface BadgeProps {
	text: number | string;
	style?: TextStyle;
	color?: string;
	type?: "number" | "string";
}

export default function Badge(props: BadgeProps = { type: "string", text: "", color: colors["lol-gold"] }) {
	const display = useMemo(() => {
		if (props.type === "number" && !Number.isNaN(Number(props.text))) {
			return formatNumber(Number(props.text), "en-US");
		}
		return props.text;
	}, []);

	return (
		<Text
			style={{
				borderWidth: 1,
				borderColor: props.color,
				color: props.color,
				backgroundColor: `${props.color}20`,
				paddingHorizontal: 8,
				paddingVertical: 2,
				borderRadius: 100,
				fontSize: 12,
				fontWeight: "semibold",
				...props.style,
			}}
		>
			{display}
		</Text>
	);
}
