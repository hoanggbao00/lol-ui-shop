import { colors } from "@/libs/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { memo, useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native";

interface SelectProps {
	value: string;
	placeholder: string;
	options: { value: string; label: string }[];
	onValueChange: (value: string) => void;
	style?: object;
}

const Select = memo(({ value, placeholder, options, onValueChange, style }: SelectProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const displayValue = value
		? options.find((option) => option.value === value)?.label
		: placeholder;

	return (
		<View style={[{ position: "relative" }, style]}>
			<TouchableOpacity
				style={styles.selectButton}
				onPress={() => setIsOpen(!isOpen)}
			>
				<Text style={styles.selectButtonText}>{displayValue}</Text>
				<Ionicons name="chevron-down" size={20} color={colors.mutedForeground} />
			</TouchableOpacity>
			{isOpen && (
				<View style={styles.selectDropdown}>
					<ScrollView 
						style={{ maxHeight: 200 }}
						nestedScrollEnabled={true}
						showsVerticalScrollIndicator={true}
					>
						{options.map((option) => (
							<TouchableOpacity
								key={option.value}
								style={styles.selectOption}
								onPress={() => {
									onValueChange(option.value);
									setIsOpen(false);
								}}
								activeOpacity={0.7}
							>
								<Text style={styles.selectOptionText}>{option.label}</Text>
								{value === option.value && (
									<Ionicons name="checkmark" size={20} color={colors.primary} />
								)}
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>
			)}
		</View>
	);
});

Select.displayName = 'Select';

const styles = StyleSheet.create({
	selectButton: {
		backgroundColor: `${colors.muted}4D`,
		borderWidth: 1,
		borderColor: `${colors.border}80`,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	selectButtonText: {
		fontSize: 14,
		color: colors.foreground,
	},
	selectDropdown: {
		position: "absolute",
		top: "100%",
		left: 0,
		right: 0,
		backgroundColor: colors.card,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: `${colors.border}80`,
		marginTop: 4,
		zIndex: 1000,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
		overflow: "hidden",
	},
	selectOption: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: `${colors.border}40`,
		backgroundColor: colors.card,
	},
	selectOptionText: {
		fontSize: 14,
		color: colors.foreground,
	},
});

export default Select;
