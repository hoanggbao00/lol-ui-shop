import type { LolAccount, Order } from "@/types";
import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	increment,
	query,
	runTransaction,
	serverTimestamp,
	where,
	orderBy,
} from "@react-native-firebase/firestore";

const ORDERS_COLL = "orders";

interface OrderWithDetails extends Order {
	fullAccountDetails?: LolAccount[]; // Dữ liệu account đầy đủ nếu cần
}

export const createOrder = async (
	orderData: Omit<Order, "id" | "createdAt">,
): Promise<string> => {
	const app = getApp();
	const db = getFirestore(app);

	// Đơn hàng nên chạy Transaction để đảm bảo các account chuyển status sang 'sold'/'renting'
	// CHỈ update account status nếu order status là "paid"
	let orderId = "";
	await runTransaction(db, async (t) => {
		// 1. Tạo Order
		const newOrderRef = doc(collection(db, ORDERS_COLL));
		orderId = newOrderRef.id;
		t.set(newOrderRef, {
			...orderData,
			createdAt: serverTimestamp(),
		});

		// 2. Cập nhật trạng thái các Account liên quan (CHỈ khi đã thanh toán)
		if (orderData.status === "paid") {
			for (const item of orderData.items) {
				const accountRef = doc(collection(db, "lol_accounts"), item.accountId);

				const newStatus =
					item.transactionType === "purchase" ? "sold" : "renting";
				t.update(accountRef, { status: newStatus });
			}
		}
	});
	return orderId;
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

/**
 * LẤY DANH SÁCH ORDERS CỦA USER
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
	const app = getApp();
	const db = getFirestore(app);
	const ordersRef = collection(db, ORDERS_COLL);

	const q = query(
		ordersRef,
		where("buyerId", "==", userId),
		orderBy("createdAt", "desc")
	);

	const snapshot = await getDocs(q);

	const orders = snapshot.docs.map((docSnap) => {
		const data = { id: docSnap.id, ...docSnap.data() } as Order;
		return data;
	});

	return orders;
};

/**
 * LẤY TẤT CẢ ORDERS (Admin only)
 */
export const getAllOrders = async (): Promise<Order[]> => {
	const app = getApp();
	const db = getFirestore(app);
	const ordersRef = collection(db, ORDERS_COLL);

	const q = query(ordersRef, orderBy("createdAt", "desc"));
	const snapshot = await getDocs(q);

	return snapshot.docs.map((docSnap) => {
		const data = { id: docSnap.id, ...docSnap.data() } as Order;
		return data;
	});
};

/**
 * LẤY ORDERS THEO ACCOUNT ID (Để biết ai đã mua/thuê account này)
 */
export const getOrdersByAccountId = async (accountId: string): Promise<Order[]> => {
	const app = getApp();
	const db = getFirestore(app);
	const ordersRef = collection(db, ORDERS_COLL);

	// Lấy tất cả orders có status paid hoặc renting
	// Note: Firestore doesn't support querying nested arrays directly,
	// so we need to fetch all orders and filter in memory
	const q = query(
		ordersRef,
		where("status", "in", ["paid", "renting"]),
		orderBy("createdAt", "desc")
	);

	const snapshot = await getDocs(q);

	// Filter orders có chứa accountId trong items
	const orders = snapshot.docs
		.map((docSnap) => {
			const data = { id: docSnap.id, ...docSnap.data() } as Order;
			return data;
		})
		.filter((order) => {
			return order.items && order.items.some((item) => item.accountId === accountId);
		});

	return orders;
};

/**
 * CẬP NHẬT TRẠNG THÁI ORDER
 */
export const updateOrderStatus = async (
	orderId: string,
	status: Order["status"],
) => {
	const app = getApp();
	const db = getFirestore(app);
	const orderRef = doc(collection(db, ORDERS_COLL), orderId);

	await runTransaction(db, async (t) => {
		const orderDoc = await t.get(orderRef);
		if (!orderDoc.exists()) {
			throw new Error("Đơn hàng không tồn tại");
		}

		const orderData = orderDoc.data() as Order;

		// Update order status
		t.update(orderRef, {
			status,
			updatedAt: serverTimestamp(),
		});

		// Nếu chuyển từ pending sang paid, update account status
		if (orderData.status === "pending" && status === "paid") {
			for (const item of orderData.items) {
				const accountRef = doc(collection(db, "lol_accounts"), item.accountId);
				const newStatus =
					item.transactionType === "purchase" ? "sold" : "renting";
				t.update(accountRef, { status: newStatus });
			}
		}
	});
};

/**
 * THU HỒI ACCOUNT ĐANG ĐƯỢC THUÊ
 * - Tìm order đang active (status === "renting" hoặc "paid" với transactionType === "rent")
 * - Refund toàn bộ tiền cho buyer
 * - Trừ tiền của seller (penalty)
 * - Update account status về "available"
 * - Update order status về "cancelled"
 */
export const reclaimAccount = async (accountId: string): Promise<void> => {
	const app = getApp();
	const db = getFirestore(app);
	const auth = getAuth(app);
	const currentUser = auth.currentUser;
	if (!currentUser) throw new Error("Vui lòng đăng nhập");

	// Không cần import createTransaction vì sẽ tạo trực tiếp với addDoc

	// Tìm order đang active
	const orders = await getOrdersByAccountId(accountId);
	const activeOrder = orders.find((order) => {
		if (order.status !== "renting" && order.status !== "paid") return false;
		const rentItem = order.items.find(
			(item) => item.accountId === accountId && item.transactionType === "rent"
		);
		return !!rentItem;
	});

	if (!activeOrder) {
		throw new Error("Không tìm thấy đơn thuê đang hoạt động");
	}

	const rentItem = activeOrder.items.find(
		(item) => item.accountId === accountId && item.transactionType === "rent"
	);
	if (!rentItem) {
		throw new Error("Không tìm thấy thông tin thuê");
	}

	const refundAmount = rentItem.price; // Toàn bộ tiền đã thuê

	// Sử dụng transaction để đảm bảo atomic
	await runTransaction(db, async (t) => {
		// 1. Update order status
		const orderRef = doc(collection(db, ORDERS_COLL), activeOrder.id!);
		t.update(orderRef, {
			status: "cancelled",
			updatedAt: serverTimestamp(),
		});

		// 2. Update account status về "available"
		const accountRef = doc(collection(db, "lol_accounts"), accountId);
		t.update(accountRef, { status: "available" });

		// 3. Refund tiền cho buyer (cộng tiền)
		const buyerRef = doc(collection(db, "users"), activeOrder.buyerId);
		t.update(buyerRef, {
			balance: increment(refundAmount),
		});

		// 4. Trừ tiền của seller (penalty)
		// Lấy account để biết sellerId
		const accountDoc = await t.get(accountRef);
		if (!accountDoc.exists()) throw new Error("Account không tồn tại");
		const accountData = accountDoc.data();
		const sellerRef = doc(collection(db, "users"), accountData.sellerId);
		t.update(sellerRef, {
			balance: increment(-refundAmount),
		});
	});

	// 5. Tạo transaction refund cho buyer (sau transaction để tránh conflict)
	// Tạo trực tiếp với status "completed" vì tiền đã được cộng trong transaction
	const transactionsRef = collection(db, "wallet_transactions");
	await addDoc(transactionsRef, {
		userId: activeOrder.buyerId,
		amount: refundAmount,
		type: "deposit",
		method: "refund",
		transactionCode: `REFUND-${activeOrder.id}-${Date.now()}`,
		status: "completed",
		createdAt: serverTimestamp(),
	});

	// Note: Không tạo transaction penalty cho seller vì đây là xử lý nội bộ
	// Tiền đã được trừ trực tiếp trong transaction ở trên
};
