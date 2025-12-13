import { getAvailableAccounts } from "@/actions/account.action";
import Background from "@/components/Background";
import Filter from "@/components/home/Filter";
import ListView from "@/components/home/ListView";
import type { LolAccount } from "@/types";
import type { Item } from "@/types/items";
import { getApp } from "@react-native-firebase/app";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

	return {
		id: account.id ? parseInt(account.id.slice(0, 8), 16) || 0 : 0,
		firestoreId: account.id || undefined, // Lưu Firestore ID gốc
		name: account.ingameName || account.title || "Unknown",
		description: account.description || "",
		rank: account.soloRank?.tier || account.flexRank?.tier || "Unranked",
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
		try {
			setLoading(true);
			setError(null);
			const result = await getAvailableAccounts(50); // Load 50 items
			const items = result.accounts.map(mapAccountToItem);
			setData(items);

			// Create map of owner IDs
			if (authUser?.uid) {
				const ownerMap = new Map<number, boolean>();
				result.accounts.forEach((account: LolAccount) => {
					const itemId = account.id ? parseInt(account.id.slice(0, 8), 16) || 0 : 0;
					ownerMap.set(itemId, account.sellerId === authUser.uid);
				});
				setOwnerIds(ownerMap);
			}
		} catch (err) {
			console.error("Error fetching accounts:", err);
			setError("Không thể tải danh sách tài khoản");
		} finally {
			setLoading(false);
		}
	}, [authUser]);

	useEffect(() => {
		if (!initializing) {
			fetchAccounts();
		}
	}, [initializing, fetchAccounts]);

	// Refetch data when tab is focused
	useFocusEffect(
		useCallback(() => {
			fetchAccounts();
		}, [fetchAccounts])
	);

	const handleNavigateToCart = () => {
		router.push("/cart");
	};

	if (loading) {
		return (
			<View style={styles.container}>
				<Background />
				<StatusBar barStyle="light-content" />
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#CABB8E" />
					<Text style={styles.loadingText}>Đang tải...</Text>
				</View>
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.container}>
				<Background />
				<StatusBar barStyle="light-content" />
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>{error}</Text>
					<TouchableOpacity onPress={fetchAccounts} style={styles.retryButton}>
						<Text style={styles.retryButtonText}>Thử lại</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	return (
		<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
			<StatusBar barStyle="light-content" />

			<View style={styles.container}>
				<Background />
				<View style={styles.header}>
					<TouchableOpacity onPress={handleNavigateToCart}>
						<Image source={icons.cart} style={styles.icon} />
					</TouchableOpacity>
				</View>
				<Filter />
				<ListView data={data} ownerIds={ownerIds} />
			</View>
		</ScrollView>
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
		fontWeight: "bold",
	},
});
