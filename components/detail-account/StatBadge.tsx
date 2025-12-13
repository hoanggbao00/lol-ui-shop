import { colors } from "@/libs/colors";
import type React from "react";
import { Text, View } from "react-native";

interface StatBadgeProps {
	label: string;
	value: string | number;
	icon?: React.ReactNode;
}

export default function StatBadge({ label, value, icon }: StatBadgeProps) {
	return (
		<View
			style={{
				flex: 1,
				alignItems: "center",
				padding: 12,
				backgroundColor: colors.card,
				borderRadius: 12,
				borderWidth: 1,
				borderColor: colors.border,
				gap: 8,
			}}
		>
			{icon && (
				<View
					style={{
						width: 40,
						height: 40,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					{icon}
				</View>
			)}
			<Text
				style={{
					fontSize: 10,
					color: colors.mutedForeground,
					textTransform: "uppercase",
					letterSpacing: 0.5,
					textAlign: "center",
				}}
			>
				{label}
			</Text>
			<Text
				style={{
					fontSize: 16,
					fontFamily: "Inter_700Bold",
					textTransform: "capitalize",
					color: colors.foreground,
				}}
			>
				{value}
			</Text>
		</View>
	);
}
