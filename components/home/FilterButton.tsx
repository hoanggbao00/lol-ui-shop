import { colors } from "@/libs/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import type React from "react";
import { useState } from "react";
import { Text, TouchableOpacity, View, type ViewStyle } from "react-native";

interface FilterButtonProps {
	placeholder: string;
	style?: ViewStyle;
	options?: {
		value: string;
		label: string;
		icon?: React.ReactNode;
	}[];
	selectedValue?: string;
	onSelectValue?: (value: string) => void;
}

export default function FilterButton(props: FilterButtonProps) {
	const { placeholder, style, selectedValue, onSelectValue, options } = props;
	const [isOpen, setIsOpen] = useState(false);

	const handlePress = () => {
		setIsOpen((prev) => !prev);
	};

	const getSelectedValueColor = (value: string) => {
		return selectedValue === value ? colors["lol-gold"] : "white";
	};

	const handleSelectValue = (value: string) => {
		if (selectedValue === value) {
			onSelectValue?.("");
		} else {
			onSelectValue?.(value);
		}

		setIsOpen(false);
	};

	const displayValue = selectedValue
		? options?.find((option) => option.value === selectedValue)
				?.label
		: placeholder;

	return (
		<View
			style={{
				position: "relative",
				...style,
			}}
		>
			<TouchableOpacity
				style={{
					flexDirection: "row",
					alignItems: "center",
					padding: 8,
					borderWidth: 1,
					borderColor: colors["lol-gold"],
					backgroundColor: "#000B0D",
					borderRadius: 6,
					justifyContent: "space-between",
					...(selectedValue && {
						backgroundColor: `${colors["lol-gold"]}50`,
					}),
				}}
				onPress={handlePress}
			>
				<Text
					style={{
						fontSize: 14,
						color: "white",
					}}
				>
					{displayValue}
				</Text>
				<Ionicons name="chevron-down" size={20} color={colors["lol-gold"]} />
			</TouchableOpacity>
			{isOpen && (
				<View
					style={{
						position: "absolute",
						top: "100%",
						left: 0,
						right: 0,
						backgroundColor: colors["card"],
						borderRadius: 6,
						padding: 8,
						borderWidth: 1,
						borderColor: colors["lol-gold"],
						gap: 8,
						zIndex: 1,
					}}
				>
					{options?.map((option) => (
						<TouchableOpacity
							key={option.value}
							onPress={() => handleSelectValue(option.value)}
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
								gap: 8,
							}}
						>
							<Text
								style={{
									color: getSelectedValueColor(option.value),
								}}
							>
								{option.label}
							</Text>
							{selectedValue === option.value && (
								<Ionicons
									name="checkmark"
									size={20}
									color={colors["lol-gold"]}
								/>
							)}
						</TouchableOpacity>
					))}
				</View>
			)}
		</View>
	);
}
