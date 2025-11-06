import { colors } from '@/libs/colors';
import React from "react";
import { Text as NativeText, type TextProps, type TextStyle } from "react-native";

export function Text(props: TextProps) {
	return (
		<NativeText
			{...props}
			style={{
				color: "white",
				...(props.style as TextStyle),
			}}
		/>
	);
}

export function TextGold(props: TextProps) {
	return (
		<Text
			{...props}
			style={{
				color: colors["lol-gold"],
				...(props.style as TextStyle),
			}}
		/>
	);
}