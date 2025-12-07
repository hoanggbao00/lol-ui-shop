import type { User } from "@/types";
import firestore from "@react-native-firebase/firestore";

const USERS_COLL = "users";

export const createUser = async (user: User) => {
	// Với User, ta dùng set() thay vì add() để ID của doc khớp với Auth UID
	await firestore().collection(USERS_COLL).doc(user.uid).set(user);
};

export const getUserById = async (uid: string): Promise<User | null> => {
	const doc = await firestore().collection(USERS_COLL).doc(uid).get();
	if (doc.exists()) {
		return doc.data() as User;
	}
	return null;
};

export const updateUserBalance = async (uid: string, amountChange: number) => {
	// Dùng FieldValue.increment để đảm bảo tính toán đồng thời không bị lỗi
	await firestore()
		.collection(USERS_COLL)
		.doc(uid)
		.update({
			balance: firestore.FieldValue.increment(amountChange),
		});
};

export const updateUser = async (uid: string, data: Partial<User>) => {
	await firestore().collection(USERS_COLL).doc(uid).update(data);
};
