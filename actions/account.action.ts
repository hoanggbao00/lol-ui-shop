import type { AccountStatus, LolAccount } from "@/types";
import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	limit,
	orderBy,
	query,
	serverTimestamp,
	startAfter,
	updateDoc,
	where,
} from "@react-native-firebase/firestore";

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
	const app = getApp();
	const auth = getAuth(app);
	const currentUser = auth.currentUser;
	if (!currentUser) throw new Error("Vui lòng đăng nhập để đăng bán");

	const db = getFirestore(app);
	const accountsRef = collection(db, ACCOUNTS_COLL);

	const newAccount = {
		...data,
		sellerId: currentUser.uid,
		status: "available" as AccountStatus,
		createdAt: serverTimestamp(),
		// Đảm bảo các trường optional không bị undefined gây lỗi
		ingameName: data.ingameName || null,
		description: data.description || "",
		soloRank: data.soloRank || null,
		flexRank: data.flexRank || null,
	};

	await addDoc(accountsRef, newAccount);
};

/**
 * 2. LẤY DANH SÁCH ACCOUNT (Có phân trang & Lọc)
 * @param limitCount Số lượng load mỗi lần
 * @param lastDoc Document cuối cùng của lần load trước (để load more)
 */
export const getAvailableAccounts = async (
	limitCount = 10,
	lastDoc?: QueryDocumentSnapshot
) => {
	const app = getApp();
	const db = getFirestore(app);
	const accountsRef = collection(db, ACCOUNTS_COLL);

	let q = query(
		accountsRef,
		where("status", "==", "available"),
		orderBy("createdAt", "desc"),
		limit(limitCount)
	);

	if (lastDoc) {
		q = query(q, startAfter(lastDoc));
	}

	const snapshot = await getDocs(q);

	const accounts = snapshot.docs.map((docSnap) => {
		const data = { id: docSnap.id, ...docSnap.data() } as LolAccount;
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
	const app = getApp();
	const db = getFirestore(app);
	const auth = getAuth(app);

	const accountRef = doc(collection(db, ACCOUNTS_COLL), accountId);
	const docSnap = await getDoc<LolAccount>(accountRef);

	if (!docSnap.exists()) return null;

	const data = { id: docSnap.id, ...docSnap.data() } as LolAccount;
	const currentUser = auth.currentUser;

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
	const app = getApp();
	const db = getFirestore(app);
	const accountsRef = collection(db, ACCOUNTS_COLL);

	const constraints = [where("status", "==", "available")];

	// Query vào Nested Object: dùng dấu chấm "."
	// Lưu ý: Cần tạo Index trên Firestore Console cho 'soloRank.tier'
	if (rankTier) {
		constraints.push(where("soloRank.tier", "==", rankTier));
	}

	if (maxPrice) {
		constraints.push(where("buyPrice", "<=", maxPrice));
	}

	const q = query(accountsRef, ...constraints);
	const snapshot = await getDocs(q);

	return snapshot.docs.map((docSnap) =>
		stripSensitiveData({ id: docSnap.id, ...docSnap.data() } as LolAccount),
	);
};

/**
 * 5. CẬP NHẬT TRẠNG THÁI (Ví dụ: Khi đã bán xong)
 */
export const updateAccountStatus = async (
	accountId: string,
	status: AccountStatus,
) => {
	const app = getApp();
	const db = getFirestore(app);
	const accountRef = doc(collection(db, ACCOUNTS_COLL), accountId);

	await updateDoc(accountRef, {
		status,
	});
};
