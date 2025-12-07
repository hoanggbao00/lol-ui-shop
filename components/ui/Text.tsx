import { colors } from '@/libs/colors';
import React from "react";
import { Text as NativeText, type TextProps as NativeTextProps, type TextStyle } from "react-native";

const fontFamilies = {
	regular: "Inter_400Regular",
	medium: "Inter_500Medium",
	semibold: "Inter_600SemiBold",
	bold: "Inter_700Bold",
	extraBold: "Inter_800ExtraBold",
} as const;

type FontFamily = keyof typeof fontFamilies;

type TextProps = {
	fontFamily?: FontFamily;
} & NativeTextProps;

export function Text({ fontFamily = "regular", ...props }: TextProps) {
	return (
		<NativeText
			{...props}
			style={{
				color: "white",
				fontFamily: fontFamilies[fontFamily],
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