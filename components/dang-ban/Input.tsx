import React from "react";
import {
	Text,
	TextInput,
	type TextStyle,
	View,
	type ViewStyle,
} from "react-native";

interface InputProps {
	label: string;
	placeholder: string;
	value: string;
	onChangeText: (text: string) => void;
	style?: ViewStyle;
	inputStyle?: TextStyle;
	numberOfLines?: number;
	isNumber?: boolean;
}

export default function Input(props: InputProps) {
	return (
		<View
			style={{
				gap: 4,
				...props.style,
			}}
		>
			<Text style={{ color: "white", fontSize: 14, fontWeight: "medium" }}>
				{props.label}
			</Text>
			<TextInput
				placeholder={props.placeholder}
				placeholderTextColor="grey"
				style={{
					borderWidth: 1,
					borderColor: 'white',
					borderRadius: 8,
					padding: 8,
					color: "white",
					...props.inputStyle,
				}}
				value={props.value}
				onChangeText={props.onChangeText}
				numberOfLines={props.numberOfLines}
				multiline={props.numberOfLines ? true : false}
				keyboardType={props.isNumber ? "numeric" : "default"}
			/>
		</View>
	);
}
