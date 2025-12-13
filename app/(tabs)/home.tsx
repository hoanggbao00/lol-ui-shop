import { filterAccounts, getAvailableAccounts } from "@/actions/account.action";
import Background from "@/components/Background";
import Filter, { type FilterRef, type FilterValues } from "@/components/home/Filter";
import ListView from "@/components/home/ListView";
import { colors } from "@/libs/colors";
import type { LolAccount } from "@/types";
import type { Item } from "@/types/items";
import { getApp } from "@react-native-firebase/app";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const icons = {
	cart: require("@/assets/icons/cart.png"),
};

// Helper function to convert LolAccount to Item
const mapAccountToItem = (account: LolAccount): Item => {
	// Map AccountStatus to Item status
	const mapStatus = (status: string): "available" | "rented" | "sold" => {
		if (status === "renting") return "rented";
		if (status === "sold") return "sold";
		return "available";
	};

	// Join ranks with "|" separator
	const ranks: string[] = [];
	if (account.soloRank?.tier) {
		ranks.push(account.soloRank.tier);
	}
	if (account.flexRank?.tier) {
		ranks.push(account.flexRank.tier);
	}
	if (account.tftRank?.tier) {
		ranks.push(account.tftRank.tier);
	}
	const rankString = ranks.length > 0 ? ranks.join(" | ") : "Unranked";

	return {
		id: account.id ? parseInt(account.id.slice(0, 8), 16) || 0 : 0,
		firestoreId: account.id || undefined, // Lưu Firestore ID gốc
		name: account.ingameName || account.title || "Unknown",
		description: account.description || "",
		rank: rankString,
		level: account.level || 0,
		championCount: account.champCount || 0,
		skinCount: account.skinCount || 0,
		blueEssence: 0,
		riotPoints: 0,
		notableSkins: "",
		rentPrice: account.rentPricePerHour || 0,
		buyPrice: account.buyPrice || 0,
		status: mapStatus(account.status),
		image: account.thumbnailUrl || "",
	};
};

export default function Index() {
	const [initializing, setInitializing] = useState(true);
	const [authUser, setAuthUser] = useState<FirebaseAuthTypes.User | null>(null);
	const [data, setData] = useState<Item[]>([]);
	const [ownerIds, setOwnerIds] = useState<Map<number, boolean>>(new Map());
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<FilterValues>({});
	const filterRef = useRef<FilterRef>(null);
	const requestIdRef = useRef(0);

	// Memoize filter change handler to prevent unnecessary re-renders
	const handleFilterChange = useCallback((newFilters: FilterValues) => {
		setFilters(newFilters);
	}, []);

	const handleAuthStateChanged = useCallback((_user: FirebaseAuthTypes.User | null) => {
		setAuthUser(_user);
		if (initializing) setInitializing(false);
	}, [initializing]);

	useEffect(() => {
		const app = getApp();
		const auth = getAuth(app);
		const subscriber = onAuthStateChanged(auth, handleAuthStateChanged);
		return subscriber;
	}, [handleAuthStateChanged]);

	const fetchAccounts = useCallback(async () => {
		// Increment request ID to track this request
		const currentRequestId = ++requestIdRef.current;
		lastFetchTimeRef.current = Date.now();

		// Capture current filters at the start of the request to avoid stale closure
		const currentFilters = filtersRef.current;

		try {
			setLoading(true);
			setError(null);

			// Check if any filter is active using captured filters
			const hasFilters = Object.keys(currentFilters).length > 0 && 
				(currentFilters.rank || currentFilters.minPrice !== undefined || currentFilters.maxPrice !== undefined ||
				 currentFilters.minSkinCount !== undefined || currentFilters.maxSkinCount !== undefined ||
				 currentFilters.minLevel !== undefined || currentFilters.maxLevel !== undefined);

			let accounts: LolAccount[];

			if (hasFilters) {
				// Use filterAccounts with filters
				isFilteringRef.current = true;
				accounts = await filterAccounts({
					rankTier: currentFilters.rank,
					minPrice: currentFilters.minPrice,
					maxPrice: currentFilters.maxPrice,
					minSkinCount: currentFilters.minSkinCount,
					maxSkinCount: currentFilters.maxSkinCount,
					minLevel: currentFilters.minLevel,
					maxLevel: currentFilters.maxLevel,
				});
			} else {
				// Use getAvailableAccounts without filters
				isFilteringRef.current = false;
				const result = await getAvailableAccounts(50);
				accounts = result.accounts;
			}

			// Check if this is still the latest request
			if (currentRequestId !== requestIdRef.current) {
				return;
			}

			const items = accounts.map(mapAccountToItem);
			setData(items);

			// Create map of owner IDs
			if (authUser?.uid) {
				const ownerMap = new Map<number, boolean>();
				accounts.forEach((account: LolAccount) => {
					const itemId = account.id ? parseInt(account.id.slice(0, 8), 16) || 0 : 0;
					ownerMap.set(itemId, account.sellerId === authUser.uid);
				});
				setOwnerIds(ownerMap);
			}
		} catch (err: any) {
			// Only handle error if this is still the latest request
			if (currentRequestId !== requestIdRef.current) {
				return;
			}
			console.error("Error fetching accounts:", err);
			setError("Không thể tải danh sách tài khoản");
			// Don't reset filters automatically - let user decide
		} finally {
			// Only set loading to false if this is still the current request
			if (currentRequestId === requestIdRef.current) {
				setLoading(false);
			}
		}
	}, [authUser?.uid]); // Remove filters from dependencies - use filtersRef instead

	// Track last fetch time to prevent duplicate fetches
	const lastFetchTimeRef = useRef(0);
	const isFilteringRef = useRef(false);
	const filtersRef = useRef<FilterValues>(filters);

	// Update filters ref when filters change
	useEffect(() => {
		filtersRef.current = filters;
	}, [filters]);

	// Fetch on initial load
	useEffect(() => {
		if (!initializing) {
			fetchAccounts();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initializing]); // Only trigger on initializing change

	// Fetch when filters change (separate effect to avoid dependency issues)
	useEffect(() => {
		if (!initializing) {
			fetchAccounts();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters.rank, filters.minPrice, filters.maxPrice, filters.minSkinCount, filters.maxSkinCount, filters.minLevel, filters.maxLevel]); // Trigger when filters change

	// Refetch data when tab is focused (only if no filters are active and enough time has passed)
	useFocusEffect(
		useCallback(() => {
			// Check if any filter is active using ref to get latest value
			const currentFilters = filtersRef.current;
			const hasFilters = Object.keys(currentFilters).length > 0 && 
				(currentFilters.rank || currentFilters.minPrice !== undefined || currentFilters.maxPrice !== undefined ||
				 currentFilters.minSkinCount !== undefined || currentFilters.maxSkinCount !== undefined ||
				 currentFilters.minLevel !== undefined || currentFilters.maxLevel !== undefined);

			// Don't refetch if:
			// 1. Still initializing
			// 2. Has active filters (let filter change trigger fetch instead)
			// 3. Just fetched recently (within 1000ms to avoid race conditions)
			// 4. Currently filtering
			const now = Date.now();
			const timeSinceLastFetch = now - lastFetchTimeRef.current;

			if (!initializing && !hasFilters && !isFilteringRef.current && timeSinceLastFetch > 1000) {
				lastFetchTimeRef.current = now;
				fetchAccounts();
			} else {
			}
		}, [fetchAccounts, initializing])
	);

	const handleNavigateToCart = () => {
		router.push("/cart");
	};

	// Don't return early on loading - keep Filter component mounted

	if (error) {
		return (
			<View style={styles.container}>
				<Background />
				<StatusBar barStyle="light-content" />
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>{error}</Text>
					<Text style={styles.errorSubText}>Có thể do filter không hợp lệ. Bạn có muốn reset filter và thử lại không?</Text>
					<View style={styles.errorButtonContainer}>
						<TouchableOpacity 
							onPress={() => {
								setError(null);
								fetchAccounts();
							}} 
							style={[styles.retryButton, styles.retryButtonSecondary]}
						>
							<Text style={[styles.retryButtonText, styles.retryButtonSecondaryText]}>Thử lại</Text>
						</TouchableOpacity>
						<TouchableOpacity 
							onPress={() => {
								filterRef.current?.reset();
								setFilters({});
								setError(null);
								fetchAccounts();
							}} 
							style={styles.retryButton}
						>
							<Text style={styles.retryButtonText}>Reset Filter & Thử lại</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Background />
			<StatusBar barStyle="light-content" />
			<ScrollView 
				style={styles.scrollView} 
				contentContainerStyle={styles.scrollViewContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.header}>
					<TouchableOpacity onPress={handleNavigateToCart}>
						<Image source={icons.cart} style={styles.icon} />
					</TouchableOpacity>
				</View>
				<Filter ref={filterRef} onFilterChange={handleFilterChange} />
				{loading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color="#CABB8E" />
						<Text style={styles.loadingText}>Đang tải...</Text>
					</View>
				) : data.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>Không tìm thấy tài khoản nào</Text>
					</View>
				) : (
					<ListView data={data} ownerIds={ownerIds} />
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	scrollViewContent: {
		flexGrow: 1,
	},
	container: {
		flex: 1,
		position: "relative",
		gap: 24,
		paddingTop: 24,
	},
	header: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
		padding: 16,
	},
	icon: {
		width: 36,
		height: 36,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 16,
	},
	loadingText: {
		color: "#CABB8E",
		fontSize: 16,
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
		gap: 16,
	},
	errorText: {
		color: "#fff",
		fontSize: 16,
		textAlign: "center",
	},
	retryButton: {
		backgroundColor: "#CABB8E",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	retryButtonText: {
		color: "#000",
		fontSize: 16,
		fontFamily: "Inter_700Bold",
	},
	errorSubText: {
		color: "#CABB8E",
		fontSize: 14,
		textAlign: "center",
		marginTop: 8,
	},
	errorButtonContainer: {
		marginTop: 16,
		gap: 12,
		width: "100%",
	},
	retryButtonSecondary: {
		backgroundColor: `${colors["lol-gold"]}30`,
		borderWidth: 1,
		borderColor: colors["lol-gold"],
	},
	retryButtonSecondaryText: {
		color: colors["lol-gold"],
	},
	emptyContainer: {
		padding: 32,
		alignItems: "center",
		justifyContent: "center",
		minHeight: 200,
	},
	emptyText: {
		color: "#CABB8E",
		fontSize: 16,
		textAlign: "center",
	},
});
