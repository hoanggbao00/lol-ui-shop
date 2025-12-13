import { getAllUsers, getUserById, updateUser } from "@/actions/user.action";
import Background from "@/components/Background";
import { colors } from "@/libs/colors";
import type { User } from "@/types";
import { getApp } from "@react-native-firebase/app";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft, Edit, Trash2, User as UserIcon } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Platform,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	ToastAndroid,
	TouchableOpacity,
	View,
} from "react-native";

export default function QuanLyUser() {
	const [initializing, setInitializing] = useState(true);
	const [authUser, setAuthUser] = useState<FirebaseAuthTypes.User | null>(null);
	const [userData, setUserData] = useState<User | null>(null);
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [editForm, setEditForm] = useState({ username: "", email: "", balance: "" });

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

	const fetchUserData = useCallback(async () => {
		if (authUser?.uid) {
			try {
				const user = await getUserById(authUser.uid);
				setUserData(user);
				if (user?.role !== "admin") {
					ToastAndroid.show("Bạn không có quyền truy cập", ToastAndroid.SHORT);
					router.back();
				}
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		}
	}, [authUser]);

	const fetchUsers = useCallback(async () => {
		try {
			setLoading(true);
			const allUsers = await getAllUsers();
			setUsers(allUsers);
		} catch (error) {
			console.error("Error fetching users:", error);
			ToastAndroid.show("Không thể tải danh sách users", ToastAndroid.SHORT);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!initializing && authUser?.uid) {
			fetchUserData();
		}
	}, [initializing, authUser, fetchUserData]);

	useFocusEffect(
		useCallback(() => {
			if (authUser?.uid && userData?.role === "admin") {
				fetchUsers();
			}
		}, [authUser, userData, fetchUsers])
	);

	const handleEdit = (user: User) => {
		setEditingUser(user);
		setEditForm({
			username: user.username,
			email: user.email,
			balance: user.balance.toString(),
		});
	};

	const handleSaveEdit = async () => {
		if (!editingUser) return;

		try {
			await updateUser(editingUser.uid, {
				username: editForm.username,
				email: editForm.email,
				balance: parseFloat(editForm.balance) || 0,
			});
			ToastAndroid.show("Cập nhật thành công", ToastAndroid.SHORT);
			setEditingUser(null);
			fetchUsers();
		} catch (error) {
			console.error("Error updating user:", error);
			ToastAndroid.show("Cập nhật thất bại", ToastAndroid.SHORT);
		}
	};

	const handleDelete = (user: User) => {
		Alert.alert(
			"Xác nhận xóa",
			`Bạn có chắc chắn muốn xóa user ${user.username}?`,
			[
				{ text: "Hủy", style: "cancel" },
				{
					text: "Xóa",
					style: "destructive",
					onPress: async () => {
						// TODO: Implement delete user
						ToastAndroid.show("Chức năng xóa user chưa được triển khai", ToastAndroid.SHORT);
					},
				},
			]
		);
	};

	if (initializing || loading) {
		return (
			<View style={[styles.container, styles.centerContent]}>
				<Background />
				<ActivityIndicator size="large" color={colors["lol-gold"]} />
			</View>
		);
	}

	if (!authUser || userData?.role !== "admin") {
		return (
			<View style={[styles.container, styles.centerContent]}>
				<Background />
				<Text style={styles.errorText}>Bạn không có quyền truy cập</Text>
			</View>
		);
	}

	// Get status bar height
	const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

	return (
		<View style={styles.container}>
			<Background />
			<StatusBar barStyle="light-content" />
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
				{/* Header */}
				<View style={[styles.header, { paddingTop: statusBarHeight }]}>
					<TouchableOpacity onPress={() => router.back()}>
						<ArrowLeft size={24} color={colors["lol-gold"]} />
					</TouchableOpacity>
					<Text style={styles.title}>Quản lý User</Text>
					<View style={{ width: 24 }} />
				</View>

				{/* Edit Modal */}
				{editingUser && (
					<View style={styles.editModal}>
						<Text style={styles.editTitle}>Chỉnh sửa User</Text>
						<TextInput
							style={styles.input}
							placeholder="Username"
							placeholderTextColor={colors.mutedForeground}
							value={editForm.username}
							onChangeText={(text) => setEditForm({ ...editForm, username: text })}
						/>
						<TextInput
							style={styles.input}
							placeholder="Email"
							placeholderTextColor={colors.mutedForeground}
							value={editForm.email}
							onChangeText={(text) => setEditForm({ ...editForm, email: text })}
						/>
						<TextInput
							style={styles.input}
							placeholder="Balance"
							placeholderTextColor={colors.mutedForeground}
							value={editForm.balance}
							onChangeText={(text) => setEditForm({ ...editForm, balance: text })}
							keyboardType="numeric"
						/>
						<View style={styles.editButtons}>
							<TouchableOpacity
								style={[styles.button, styles.cancelButton]}
								onPress={() => setEditingUser(null)}
							>
								<Text style={styles.cancelButtonText}>Hủy</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.button, styles.saveButton]}
								onPress={handleSaveEdit}
							>
								<Text style={styles.saveButtonText}>Lưu</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}

				{/* Users List */}
				{users.map((user) => (
					<View key={user.uid} style={styles.userCard}>
						<View style={styles.userIconContainer}>
							<UserIcon size={24} color={colors["lol-gold"]} />
						</View>
						<View style={styles.userInfo}>
							<Text style={styles.userName}>{user.username}</Text>
							<Text style={styles.userEmail}>{user.email}</Text>
							<Text style={styles.userBalance}>
								Số dư: {user.balance.toLocaleString("vi-VN")} ₫
							</Text>
							<Text style={styles.userRole}>
								Vai trò: {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
							</Text>
						</View>
						<View style={styles.userActions}>
							<TouchableOpacity
								style={styles.actionButton}
								onPress={() => handleEdit(user)}
							>
								<Edit size={20} color={colors["lol-gold"]} />
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.actionButton}
								onPress={() => handleDelete(user)}
							>
								<Trash2 size={20} color={colors.destructive} />
							</TouchableOpacity>
						</View>
					</View>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: "relative",
	},
	centerContent: {
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		color: colors["lol-gold"],
		fontSize: 16,
		fontFamily: "Inter_600SemiBold",
		textAlign: "center",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
		paddingBottom: 100,
		gap: 16,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	title: {
		fontSize: 24,
		fontFamily: "Inter_700Bold",
		color: colors["lol-gold"],
	},
	editModal: {
		backgroundColor: `${colors.card}80`,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: `${colors.border}4D`,
		padding: 16,
		gap: 12,
		marginBottom: 16,
	},
	editTitle: {
		fontSize: 18,
		fontFamily: "Inter_700Bold",
		color: colors["lol-gold"],
		marginBottom: 8,
	},
	input: {
		backgroundColor: `${colors.card}40`,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: `${colors.border}4D`,
		padding: 12,
		color: colors.foreground,
		fontSize: 14,
	},
	editButtons: {
		flexDirection: "row",
		gap: 12,
		marginTop: 8,
	},
	button: {
		flex: 1,
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	cancelButton: {
		backgroundColor: `${colors.destructive}1A`,
		borderWidth: 1,
		borderColor: colors.destructive,
	},
	cancelButtonText: {
		color: colors.destructive,
		fontFamily: "Inter_600SemiBold",
	},
	saveButton: {
		backgroundColor: colors["lol-gold"],
	},
	saveButtonText: {
		color: "#000",
		fontFamily: "Inter_600SemiBold",
	},
	userCard: {
		flexDirection: "row",
		backgroundColor: `${colors.card}80`,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: `${colors.border}4D`,
		padding: 16,
		gap: 16,
		alignItems: "center",
	},
	userIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: `${colors["lol-gold"]}1A`,
		alignItems: "center",
		justifyContent: "center",
	},
	userInfo: {
		flex: 1,
		gap: 4,
	},
	userName: {
		fontSize: 16,
		fontFamily: "Inter_700Bold",
		color: colors.foreground,
	},
	userEmail: {
		fontSize: 14,
		color: colors.mutedForeground,
	},
	userBalance: {
		fontSize: 14,
		color: colors["lol-gold"],
	},
	userRole: {
		fontSize: 12,
		color: colors.mutedForeground,
	},
	userActions: {
		flexDirection: "row",
		gap: 8,
	},
	actionButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: `${colors.card}40`,
		alignItems: "center",
		justifyContent: "center",
	},
});

