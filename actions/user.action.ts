import type { User } from "@/types";
import { getApp } from "@react-native-firebase/app";
import { getAuth, EmailAuthProvider } from "@react-native-firebase/auth";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	increment,
	orderBy,
	query,
	setDoc,
	updateDoc,
} from "@react-native-firebase/firestore";

const USERS_COLL = "users";

export const createUser = async (user: User) => {
	// Với User, ta dùng set() thay vì add() để ID của doc khớp với Auth UID
	const app = getApp();
	const db = getFirestore(app);
	const userRef = doc(collection(db, USERS_COLL), user.uid);
	await setDoc(userRef, user);
};

export const getUserById = async (uid: string): Promise<User | null> => {
	const app = getApp();
	const db = getFirestore(app);
	const userRef = doc(collection(db, USERS_COLL), uid);
	const docSnap = await getDoc(userRef);

	if (docSnap.exists()) {
		return docSnap.data() as User;
	}
	return null;
};

export const updateUserBalance = async (uid: string, amountChange: number) => {
	// Dùng increment để đảm bảo tính toán đồng thời không bị lỗi
	const app = getApp();
	const db = getFirestore(app);
	const userRef = doc(collection(db, USERS_COLL), uid);
	await updateDoc(userRef, {
		balance: increment(amountChange),
	});
};

export const updateUser = async (uid: string, data: Partial<User>) => {
	const app = getApp();
	const db = getFirestore(app);
	const userRef = doc(collection(db, USERS_COLL), uid);
	await updateDoc(userRef, data);
};

/**
 * LẤY TẤT CẢ USERS (Admin only)
 */
export const getAllUsers = async (): Promise<User[]> => {
	const app = getApp();
	const db = getFirestore(app);
	const usersRef = collection(db, USERS_COLL);

	const q = query(usersRef, orderBy("createdAt", "desc"));
	const snapshot = await getDocs(q);

	return snapshot.docs.map((docSnap) => ({
		uid: docSnap.id,
		...docSnap.data(),
	} as User));
};

/**
 * ĐỔI MẬT KHẨU CỦA USER
 * @param currentPassword Mật khẩu hiện tại
 * @param newPassword Mật khẩu mới
 * @throws Error nếu mật khẩu hiện tại không đúng hoặc có lỗi xảy ra
 */
export const updatePassword = async (
	currentPassword: string,
	newPassword: string
): Promise<void> => {
	const app = getApp();
	const auth = getAuth(app);
	const user = auth.currentUser;

	if (!user || !user.email) {
		throw new Error("Không tìm thấy thông tin người dùng");
	}

	// Validation
	if (!currentPassword || !newPassword) {
		throw new Error("Vui lòng điền đầy đủ thông tin");
	}

	if (newPassword.length < 6) {
		throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
	}

	// Re-authenticate user with current password
	const credential = EmailAuthProvider.credential(
		user.email,
		currentPassword
	);
	await user.reauthenticateWithCredential(credential);

	// Update password
	await user.updatePassword(newPassword);
};
