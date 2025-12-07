import type { WalletTransaction } from "@/types";
import firestore from "@react-native-firebase/firestore";

const TRANSACTIONS_COLL = "wallet_transactions";

export const createTransaction = async (
	data: Omit<WalletTransaction, "id" | "createdAt" | "status">,
) => {
	await firestore()
		.collection(TRANSACTIONS_COLL)
		.add({
			...data,
			status: "pending",
			createdAt: firestore.FieldValue.serverTimestamp(),
		});
};

export const getUserTransactions = async (userId: string) => {
	const snapshot = await firestore()
		.collection(TRANSACTIONS_COLL)
		.where("userId", "==", userId)
		.orderBy("createdAt", "desc")
		.get();

	return snapshot.docs.map(
		(doc) => ({ id: doc.id, ...doc.data() }) as WalletTransaction,
	);
};

// Hàm dành cho Admin duyệt tiền
export const approveTransaction = async (
	transactionId: string,
	adminNote: string,
) => {
	const transRef = firestore().collection(TRANSACTIONS_COLL).doc(transactionId);

	// Dùng Transaction (Atomic) để đảm bảo: Cập nhật trạng thái + Cộng tiền user cùng lúc
	await firestore().runTransaction(async (t) => {
		const transDoc = await t.get(transRef);
		if (!transDoc.exists) throw new Error("Giao dịch không tồn tại");

		const transData = transDoc.data() as WalletTransaction;
		if (transData.status !== "pending")
			throw new Error("Giao dịch đã được xử lý");

		// 1. Update trạng thái giao dịch
		t.update(transRef, {
			status: "completed",
			adminNote,
			updatedAt: firestore.FieldValue.serverTimestamp(),
		});

		// 2. Cộng/Trừ tiền User
		const userRef = firestore().collection("users").doc(transData.userId);
		const amount =
			transData.type === "deposit" ? transData.amount : -transData.amount;

		t.update(userRef, {
			balance: firestore.FieldValue.increment(amount),
		});
	});
};
