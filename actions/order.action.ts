import type { LolAccount, Order } from "@/types";
import firestore from "@react-native-firebase/firestore";

const ORDERS_COLL = "orders";

interface OrderWithDetails extends Order {
	fullAccountDetails?: LolAccount[]; // Dữ liệu account đầy đủ nếu cần
}

export const createOrder = async (
	orderData: Omit<Order, "id" | "createdAt">,
) => {
	// Đơn hàng nên chạy Transaction để đảm bảo các account chuyển status sang 'sold'/'renting'
	await firestore().runTransaction(async (t) => {
		// 1. Tạo Order
		const newOrderRef = firestore().collection(ORDERS_COLL).doc();
		t.set(newOrderRef, {
			...orderData,
			createdAt: firestore.FieldValue.serverTimestamp(),
		});

		// 2. Cập nhật trạng thái các Account liên quan
		for (const item of orderData.items) {
			const accountRef = firestore()
				.collection("lol_accounts")
				.doc(item.accountId);

			const newStatus =
				item.transactionType === "purchase" ? "sold" : "renting";
			t.update(accountRef, { status: newStatus });
		}
	});
};

export const getOrderById = async (
	orderId: string,
	withRelations = false,
): Promise<OrderWithDetails | null> => {
	const doc = await firestore().collection(ORDERS_COLL).doc(orderId).get();
	if (!doc.exists) return null;

	const order = { id: doc.id, ...doc.data() } as Order;

	if (withRelations) {
		// Lấy chi tiết thông tin các account trong đơn hàng
		const accountPromises = order.items.map((item) =>
			firestore().collection("lol_accounts").doc(item.accountId).get(),
		);

		const accountSnapshots = await Promise.all(accountPromises);
		const accounts = accountSnapshots.map(
			(s) => ({ id: s.id, ...s.data() }) as LolAccount,
		);

		return { ...order, fullAccountDetails: accounts };
	}

	return order;
};
