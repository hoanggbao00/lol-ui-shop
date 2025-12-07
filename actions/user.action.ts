import type { User } from "@/types";
import { getApp } from "@react-native-firebase/app";
import {
	collection,
	doc,
	getDoc,
	getFirestore,
	increment,
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
