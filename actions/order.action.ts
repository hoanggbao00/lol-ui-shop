import type { LolAccount, Order } from "@/types";
import { getApp } from "@react-native-firebase/app";
import {
	collection,
	doc,
	getDoc,
	getFirestore,
	runTransaction,
	serverTimestamp,
} from "@react-native-firebase/firestore";

const ORDERS_COLL = "orders";

interface OrderWithDetails extends Order {
	fullAccountDetails?: LolAccount[]; // Dữ liệu account đầy đủ nếu cần
}

export const createOrder = async (
	orderData: Omit<Order, "id" | "createdAt">,
) => {
	const app = getApp();
	const db = getFirestore(app);

	// Đơn hàng nên chạy Transaction để đảm bảo các account chuyển status sang 'sold'/'renting'
	await runTransaction(db, async (t) => {
		// 1. Tạo Order
		const newOrderRef = doc(collection(db, ORDERS_COLL));
		t.set(newOrderRef, {
			...orderData,
			createdAt: serverTimestamp(),
		});

		// 2. Cập nhật trạng thái các Account liên quan
		for (const item of orderData.items) {
			const accountRef = doc(collection(db, "lol_accounts"), item.accountId);

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
	const app = getApp();
	const db = getFirestore(app);

	const orderRef = doc(collection(db, ORDERS_COLL), orderId);
	const docSnap = await getDoc(orderRef);

	if (!docSnap.exists()) return null;

	const data = docSnap.data() as Order;

	const order = { id: docSnap.id, ...data } as Order;

	if (withRelations) {
		// Lấy chi tiết thông tin các account trong đơn hàng
		const accountPromises = order.items.map((item) => {
			const accountRef = doc(collection(db, "lol_accounts"), item.accountId);
			return getDoc(accountRef);
		});

		const accountSnapshots = await Promise.all(accountPromises);
		const accounts = accountSnapshots.map(
			(s) => ({ id: s.id, ...s.data() }) as LolAccount,
		);

		return { ...order, fullAccountDetails: accounts };
	}

	return order;
};
