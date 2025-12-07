import type { WalletTransaction } from "@/types";
import { getApp } from "@react-native-firebase/app";
import {
	addDoc,
	collection,
	doc,
	getDocs,
	getFirestore,
	increment,
	orderBy,
	query,
	runTransaction,
	serverTimestamp,
	where,
} from "@react-native-firebase/firestore";

const TRANSACTIONS_COLL = "wallet_transactions";

export const createTransaction = async (
	data: Omit<WalletTransaction, "id" | "createdAt" | "status">,
) => {
	const app = getApp();
	const db = getFirestore(app);
	const transactionsRef = collection(db, TRANSACTIONS_COLL);

	await addDoc(transactionsRef, {
		...data,
		status: "pending",
		createdAt: serverTimestamp(),
	});
};

export const getUserTransactions = async (userId: string) => {
	const app = getApp();
	const db = getFirestore(app);
	const transactionsRef = collection(db, TRANSACTIONS_COLL);

	const q = query(
		transactionsRef,
		where("userId", "==", userId),
		orderBy("createdAt", "desc"),
	);

	const snapshot = await getDocs(q);

	return snapshot.docs.map(
		(docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as WalletTransaction,
	);
};

// Hàm dành cho Admin duyệt tiền
export const approveTransaction = async (
	transactionId: string,
	adminNote: string,
) => {
	const app = getApp();
	const db = getFirestore(app);
	const transRef = doc(collection(db, TRANSACTIONS_COLL), transactionId);

	// Dùng Transaction (Atomic) để đảm bảo: Cập nhật trạng thái + Cộng tiền user cùng lúc
	await runTransaction(db, async (t) => {
		const transDoc = await t.get(transRef);
		if (!transDoc.exists()) throw new Error("Giao dịch không tồn tại");

		const transData = transDoc.data() as WalletTransaction;
		if (transData.status !== "pending")
			throw new Error("Giao dịch đã được xử lý");

		// 1. Update trạng thái giao dịch
		t.update(transRef, {
			status: "completed",
			adminNote,
			updatedAt: serverTimestamp(),
		});

		// 2. Cộng/Trừ tiền User
		const userRef = doc(collection(db, "users"), transData.userId);
		const amount =
			transData.type === "deposit" ? transData.amount : -transData.amount;

		t.update(userRef, {
			balance: increment(amount),
		});
	});
};
