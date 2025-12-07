import type { CartItem, LolAccount } from "@/types";
import { getApp } from "@react-native-firebase/app";
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	serverTimestamp,
} from "@react-native-firebase/firestore";

// Dùng Sub-collection: users/{uid}/cart_items/{itemId}
const getCartRef = (userId: string) => {
	const app = getApp();
	const db = getFirestore(app);
	return collection(doc(collection(db, "users"), userId), "cart_items");
};

export const addToCart = async (
	userId: string,
	item: Omit<CartItem, "id" | "userId" | "createdAt">,
) => {
	const cartRef = getCartRef(userId);
	await addDoc(cartRef, {
		...item,
		userId, // Vẫn lưu dư thừa để tiện query nếu cần
		createdAt: serverTimestamp(),
	});
};

export const removeFromCart = async (userId: string, cartItemId: string) => {
	const app = getApp();
	const db = getFirestore(app);
	const cartItemRef = doc(
		collection(doc(collection(db, "users"), userId), "cart_items"),
		cartItemId,
	);
	await deleteDoc(cartItemRef);
};

export const getCartItems = async (userId: string) => {
	const app = getApp();
	const db = getFirestore(app);
	const cartRef = getCartRef(userId);

	const snapshot = await getDocs(cartRef);
	const cartItems = snapshot.docs.map(
		(docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as CartItem,
	);

	// JOIN: Lấy thông tin chi tiết Account cho mỗi item trong giỏ
	const detailedItems = await Promise.all(
		cartItems.map(async (item) => {
			const accRef = doc(collection(db, "lol_accounts"), item.accountId);
			const accDoc = await getDoc(accRef);
			return {
				...item,
				accountData: accDoc.exists() ? (accDoc.data() as LolAccount) : null,
			};
		}),
	);

	return detailedItems;
};
