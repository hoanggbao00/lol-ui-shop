import Select from "@/components/Select";
import { colors } from "@/libs/colors";
import React, { memo } from "react";
import {
	StyleSheet,
	Text,
	TextInput,
	View
} from "react-native";

interface RankSelectorProps {
	label: string;
	rank: string;
	division: string;
	lp: string;
	wins: string;
	rankOptions: { value: string; label: string }[];
	divisionOptions: { value: string; label: string }[];
	onRankChange: (value: string) => void;
	onDivisionChange: (value: string) => void;
	onLPChange: (value: string) => void;
	onWinsChange: (value: string) => void;
}

const RankSelector = memo(({
	label,
	rank,
	division,
	lp,
	wins,
	rankOptions,
	divisionOptions,
	onRankChange,
	onDivisionChange,
	onLPChange,
	onWinsChange
}: RankSelectorProps) => (
	<View style={styles.rankSelector}>
		<Text style={styles.rankSelectorLabel}>{label}</Text>
		<View style={styles.rankRow}>
			<Select
				value={rank}
				placeholder="Rank"
				options={rankOptions}
				onValueChange={onRankChange}
				style={{ flex: 1 }}
			/>
			<Select
				value={division}
				placeholder="Division"
				options={divisionOptions}
				onValueChange={onDivisionChange}
				style={{ flex: 1 }}
			/>
		</View>
		<View style={styles.rankRow}>
			<TextInput
				style={styles.input}
				placeholder="LP"
				placeholderTextColor={colors.mutedForeground}
				keyboardType="numeric"
				value={lp}
				onChangeText={onLPChange}
			/>
			<TextInput
				style={styles.input}
				placeholder="Wins"
				placeholderTextColor={colors.mutedForeground}
				keyboardType="numeric"
				value={wins}
				onChangeText={onWinsChange}
			/>
		</View>
	</View>
));

RankSelector.displayName = 'RankSelector';

const styles = StyleSheet.create({
	rankSelector: {
		backgroundColor: `${colors.muted}33`,
		borderRadius: 12,
		padding: 12,
		gap: 12,
	},
	rankSelectorLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: colors.foreground,
	},
	rankRow: {
		flexDirection: "row",
		gap: 12,
	},
	input: {
		flex: 1,
		backgroundColor: `${colors.muted}4D`,
		borderWidth: 1,
		borderColor: `${colors.border}80`,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 14,
		color: colors.foreground,
	},
});

export default RankSelector;
