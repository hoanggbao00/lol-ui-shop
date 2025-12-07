import type { AccountStatus, LolAccount } from "@/types";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const ACCOUNTS_COLL = "lol_accounts";

// Payload khi tạo: Bỏ các trường tự sinh (id, createdAt, sellerId)
type CreateAccountPayload = Omit<
	LolAccount,
	"id" | "sellerId" | "createdAt" | "status"
>;

// Helper: Xóa thông tin nhạy cảm trước khi trả về cho khách xem
const stripSensitiveData = (data: LolAccount): LolAccount => {
	const cleanData = { ...data };
	cleanData.loginUsername = undefined;  
	cleanData.loginPassword = undefined;  
	return cleanData;
};

/**
 * 1. ĐĂNG BÁN ACCOUNT MỚI
 */
export const createAccount = async (data: CreateAccountPayload) => {
	const currentUser = auth().currentUser;
	if (!currentUser) throw new Error("Vui lòng đăng nhập để đăng bán");

	const newAccount = {
		...data,
		sellerId: currentUser.uid,
		status: "available" as AccountStatus,
		createdAt: firestore.FieldValue.serverTimestamp(),
		// Đảm bảo các trường optional không bị undefined gây lỗi
		ingameName: data.ingameName || null,
		description: data.description || "",
		soloRank: data.soloRank || null,
		flexRank: data.flexRank || null,
	};

	await firestore().collection(ACCOUNTS_COLL).add(newAccount);
};

/**
 * 2. LẤY DANH SÁCH ACCOUNT (Có phân trang & Lọc)
 * @param limit Số lượng load mỗi lần
 * @param lastDoc Document cuối cùng của lần load trước (để load more)
 */

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export  const getAvailableAccounts = async (limit = 10, lastDoc?: any) => {
	let query = firestore()
		.collection(ACCOUNTS_COLL)
		.where("status", "==", "available")
		.orderBy("createdAt", "desc")
		.limit(limit);

	if (lastDoc) {
		query = query.startAfter(lastDoc);
	}

	const snapshot = await query.get();

	const accounts = snapshot.docs.map((doc) => {
		const data = { id: doc.id, ...doc.data() } as LolAccount;
		// Với danh sách bên ngoài, ta luôn ẩn pass
		return stripSensitiveData(data);
	});

	return {
		accounts,
		lastDoc: snapshot.docs[snapshot.docs.length - 1],
	};
};

/**
 * 3. LẤY CHI TIẾT ACCOUNT
 * Logic: Nếu là người bán (owner) thì thấy pass, người lạ thì ẩn pass.
 */
export const getAccountById = async (
	accountId: string,
): Promise<LolAccount | null> => {
	const doc = await firestore().collection(ACCOUNTS_COLL).doc(accountId).get();

	if (!doc.exists) return null;

	const data = { id: doc.id, ...doc.data() } as LolAccount;
	const currentUser = auth().currentUser;

	// Logic bảo mật phía Client:
	// Chỉ trả về User/Pass nếu người xem là chủ sở hữu (Seller)
	// (Lưu ý: Để bảo mật tuyệt đối, cần setup Firestore Rules chặn đọc field này)
	if (currentUser?.uid === data.sellerId) {
		return data;
	}

	// Khách xem -> Ẩn pass
	return stripSensitiveData(data);
};

/**
 * 4. TÌM KIẾM NÂNG CAO (Query Nested Object)
 * Ví dụ: Tìm tất cả rank 'Gold'
 */
export const filterAccounts = async (
	rankTier?: string,
	minPrice?: number,
	maxPrice?: number,
) => {
	let query = firestore()
		.collection(ACCOUNTS_COLL)
		.where("status", "==", "available");

	// Query vào Nested Object: dùng dấu chấm "."
	// Lưu ý: Cần tạo Index trên Firestore Console cho 'soloRank.tier'
	if (rankTier) {
		query = query.where("soloRank.tier", "==", rankTier);
	}

	if (maxPrice) {
		query = query.where("buyPrice", "<=", maxPrice);
	}

	const snapshot = await query.get();
	return snapshot.docs.map((doc) =>
		stripSensitiveData({ id: doc.id, ...doc.data() } as LolAccount),
	);
};

/**
 * 5. CẬP NHẬT TRẠNG THÁI (Ví dụ: Khi đã bán xong)
 */
export const updateAccountStatus = async (
	accountId: string,
	status: AccountStatus,
) => {
	await firestore().collection(ACCOUNTS_COLL).doc(accountId).update({
		status: status,
	});
};
