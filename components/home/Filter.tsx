import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import FilterButton from "./FilterButton";

export interface FilterValues {
	rank?: string;
	minPrice?: number;
	maxPrice?: number;
	minSkinCount?: number;
	maxSkinCount?: number;
	minLevel?: number;
	maxLevel?: number;
}

export interface FilterRef {
	reset: () => void;
}

interface FilterProps {
	onFilterChange?: (filters: FilterValues) => void;
}

const Filter = React.forwardRef<FilterRef, FilterProps>(({ onFilterChange }, ref) => {
	const [rank, setRank] = useState("");
	const [price, setPrice] = useState("");
	const [skin, setSkin] = useState("");
	const [level, setLevel] = useState("");

	// Rank options theo format của database (tier values)
	const rankOptions = [
		{ value: "Unranked", label: "Unranked" },
		{ value: "Iron", label: "Iron" },
		{ value: "Bronze", label: "Bronze" },
		{ value: "Silver", label: "Silver" },
		{ value: "Gold", label: "Gold" },
		{ value: "Platinum", label: "Platinum" },
		{ value: "Emerald", label: "Emerald" },
		{ value: "Diamond", label: "Diamond" },
		{ value: "Master", label: "Master" },
		{ value: "Grandmaster", label: "Grandmaster" },
		{ value: "Challenger", label: "Challenger" },
	];

	const priceOptions = [
		{ value: "0-500000", label: "Dưới 500,000" },
		{ value: "500000-1000000", label: "500,000 - 1,000,000" },
		{ value: "1000000-2000000", label: "1,000,000 - 2,000,000" },
		{ value: "2000000-5000000", label: "2,000,000 - 5,000,000" },
		{ value: "5000000-10000000", label: "5,000,000 - 10,000,000" },
		{ value: "10000000-999999999", label: "Trên 10,000,000" },
	];

	const skinOptions = [
		{ value: "0-50", label: "0 - 50" },
		{ value: "50-100", label: "50 - 100" },
		{ value: "100-150", label: "100 - 150" },
		{ value: "150-200", label: "150 - 200" },
		{ value: "200-999999", label: "Trên 200" },
	];

	const levelOptions = [
		{ value: "0-100", label: "0 - 100" },
		{ value: "100-200", label: "100 - 200" },
		{ value: "200-300", label: "200 - 300" },
		{ value: "300-400", label: "300 - 400" },
		{ value: "400-500", label: "400 - 500" },
		{ value: "500-999999", label: "Trên 500" },
	];

	// Use ref to store previous filters to avoid unnecessary updates
	const prevFiltersRef = useRef<string>("");

	// Reset function
	const reset = () => {
		setRank("");
		setPrice("");
		setSkin("");
		setLevel("");
		prevFiltersRef.current = JSON.stringify({});
		// Trigger onFilterChange with empty filters immediately
		onFilterChange?.({});
	};

	// Expose reset function via ref
	useImperativeHandle(ref, () => ({
		reset,
	}));

	// Parse filter values và notify parent
	useEffect(() => {
		const filters: FilterValues = {};

		// Rank filter
		if (rank) {
			filters.rank = rank;
		}

		// Price filter
		if (price) {
			const [min, max] = price.split("-").map(Number);
			filters.minPrice = min;
			filters.maxPrice = max === 999999999 ? undefined : max;
		}

		// Skin count filter
		if (skin) {
			const [min, max] = skin.split("-").map(Number);
			filters.minSkinCount = min;
			filters.maxSkinCount = max === 999999 ? undefined : max;
		}

		// Level filter
		if (level) {
			const [min, max] = level.split("-").map(Number);
			filters.minLevel = min;
			filters.maxLevel = max === 999999 ? undefined : max;
		}

		// Create a string key to compare filters
		const filterKey = JSON.stringify(filters);
		
		// Only call onFilterChange if filters actually changed
		if (filterKey !== prevFiltersRef.current) {
			prevFiltersRef.current = filterKey;
			onFilterChange?.(filters);
		}
	}, [rank, price, skin, level]); // Removed onFilterChange from dependencies

	return (
		<View>
			<View style={styles.container}>
				<FilterButton
					placeholder="Tìm theo rank"
					style={styles.filterButton}
					options={rankOptions}
					selectedValue={rank}
					onSelectValue={setRank}
				/>
				<FilterButton
					placeholder="Tìm theo giá"
					style={styles.filterButton}
					options={priceOptions}
					selectedValue={price}
					onSelectValue={setPrice}
				/>
			</View>
			<View style={styles.container}>
				<FilterButton
					placeholder="Số trang phục"
					style={styles.filterButton}	
					options={skinOptions}
					selectedValue={skin}
					onSelectValue={setSkin}
				/>
				<FilterButton
					placeholder="Tìm theo level"
					style={styles.filterButton}
					options={levelOptions}
					selectedValue={level}
					onSelectValue={setLevel}
				/>
			</View>
		</View>
	);
});

Filter.displayName = "Filter";

export default Filter;

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		gap: 8,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	filterButton: {
    flex: 1
	},
});
