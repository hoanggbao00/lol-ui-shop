import type { CartItem, LolAccount } from "@/types";
import firestore from "@react-native-firebase/firestore";

// Dùng Sub-collection: users/{uid}/cart_items/{itemId}
const getCartRef = (userId: string) =>
	firestore().collection("users").doc(userId).collection("cart_items");

export const addToCart = async (
	userId: string,
	item: Omit<CartItem, "id" | "userId" | "createdAt">,
) => {
	await getCartRef(userId).add({
		...item,
		userId, // Vẫn lưu dư thừa để tiện query nếu cần
		createdAt: firestore.FieldValue.serverTimestamp(),
	});
};

export const removeFromCart = async (userId: string, cartItemId: string) => {
	await getCartRef(userId).doc(cartItemId).delete();
};

export const getCartItems = async (userId: string) => {
	const snapshot = await getCartRef(userId).get();
	const cartItems = snapshot.docs.map(
		(doc) => ({ id: doc.id, ...doc.data() }) as CartItem,
	);

	// JOIN: Lấy thông tin chi tiết Account cho mỗi item trong giỏ
	const detailedItems = await Promise.all(
		cartItems.map(async (item) => {
			const accDoc = await firestore()
				.collection("lol_accounts")
				.doc(item.accountId)
				.get();
			return {
				...item,
				accountData: accDoc.exists() ? (accDoc.data() as LolAccount) : null,
			};
		}),
	);

	return detailedItems;
};
