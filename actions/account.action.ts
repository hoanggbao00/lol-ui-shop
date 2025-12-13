import type { AccountStatus, LolAccount } from "@/types";
import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import {
	addDoc,
	collection,
	deleteDoc,
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

	// Loại bỏ các field có giá trị undefined (Firestore không chấp nhận undefined)
	const cleanData: any = {
		sellerId: currentUser.uid,
		status: "available" as AccountStatus,
		createdAt: serverTimestamp(),
		title: data.title,
	};

	// Chỉ thêm các field không undefined
	if (data.level !== undefined) cleanData.level = data.level;
	if (data.ingameName) cleanData.ingameName = data.ingameName;
	if (data.description) cleanData.description = data.description;
	if (data.server) cleanData.server = data.server;
	if (data.region) cleanData.region = data.region;
	if (data.champCount !== undefined) cleanData.champCount = data.champCount;
	if (data.skinCount !== undefined) cleanData.skinCount = data.skinCount;
	if (data.soloRank) cleanData.soloRank = data.soloRank;
	if (data.flexRank) cleanData.flexRank = data.flexRank;
	if (data.loginUsername) cleanData.loginUsername = data.loginUsername;
	if (data.loginPassword) cleanData.loginPassword = data.loginPassword;
	if (data.buyPrice !== undefined) cleanData.buyPrice = data.buyPrice;
	if (data.rentPricePerHour !== undefined) cleanData.rentPricePerHour = data.rentPricePerHour;
	if (data.thumbnailUrl) cleanData.thumbnailUrl = data.thumbnailUrl;

	console.log('Creating account with data:', cleanData);
	const docRef = await addDoc(accountsRef, cleanData);
	console.log('Account created with ID:', docRef.id);
	return docRef.id;
};

/**
 * 2. LẤY DANH SÁCH ACCOUNT (Có phân trang & Lọc)
 * @param limitCount Số lượng load mỗi lần
 * @param lastDoc Document cuối cùng của lần load trước (để load more)
 */
export const getAvailableAccounts = async (
	limitCount = 10,
	lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot
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
	// Validate accountId
	if (!accountId || accountId === "0" || accountId === "undefined" || accountId.trim() === "") {
		console.error("Invalid accountId:", accountId);
		return null;
	}

	const app = getApp();
	const db = getFirestore(app);
	const auth = getAuth(app);

	console.log("Fetching account with ID:", accountId);

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

/**
 * 6. LẤY DANH SÁCH ACCOUNT CỦA NGƯỜI BÁN (Bài đã đăng)
 * @param sellerId ID của người bán
 * @param limitCount Số lượng load mỗi lần
 * @param lastDoc Document cuối cùng của lần load trước (để load more)
 */
export const getAccountsBySellerId = async (
	sellerId: string,
	limitCount = 10,
	lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot
) => {
	const app = getApp();
	const db = getFirestore(app);
	const accountsRef = collection(db, ACCOUNTS_COLL);

	let q = query(
		accountsRef,
		where("sellerId", "==", sellerId),
		orderBy("createdAt", "desc"),
		limit(limitCount)
	);

	if (lastDoc) {
		q = query(q, startAfter(lastDoc));
	}

	const snapshot = await getDocs(q);

	const accounts = snapshot.docs.map((docSnap) => {
		const data = { id: docSnap.id, ...docSnap.data() } as LolAccount;
		// Với danh sách của chính người bán, trả về đầy đủ thông tin (không ẩn pass)
		return data;
	});

	return {
		accounts,
		lastDoc: snapshot.docs[snapshot.docs.length - 1],
	};
};

/**
 * 7. CẬP NHẬT ACCOUNT
 * @param accountId ID của account cần update
 * @param data Dữ liệu cần update (tương tự CreateAccountPayload)
 */
export const updateAccount = async (
	accountId: string,
	data: Partial<CreateAccountPayload>
) => {
	const app = getApp();
	const auth = getAuth(app);
	const currentUser = auth.currentUser;
	if (!currentUser) throw new Error("Vui lòng đăng nhập");

	const db = getFirestore(app);
	const accountRef = doc(collection(db, ACCOUNTS_COLL), accountId);

	// Kiểm tra quyền sở hữu
	const accountDoc = await getDoc(accountRef);
	if (!accountDoc.exists()) {
		throw new Error("Tài khoản không tồn tại");
	}

	const accountData = accountDoc.data() as LolAccount;
	if (accountData.sellerId !== currentUser.uid) {
		throw new Error("Bạn không có quyền chỉnh sửa tài khoản này");
	}

	// Chuẩn bị dữ liệu update (chỉ update các field được truyền vào)
	const updateData: any = {};

	if (data.title !== undefined) updateData.title = data.title;
	if (data.level !== undefined) updateData.level = data.level;
	if (data.ingameName !== undefined) updateData.ingameName = data.ingameName;
	if (data.description !== undefined) updateData.description = data.description;
	if (data.server !== undefined) updateData.server = data.server;
	if (data.region !== undefined) updateData.region = data.region;
	if (data.champCount !== undefined) updateData.champCount = data.champCount;
	if (data.skinCount !== undefined) updateData.skinCount = data.skinCount;
	if (data.soloRank !== undefined) updateData.soloRank = data.soloRank;
	if (data.flexRank !== undefined) updateData.flexRank = data.flexRank;
	if (data.loginUsername !== undefined) updateData.loginUsername = data.loginUsername;
	if (data.loginPassword !== undefined) updateData.loginPassword = data.loginPassword;
	if (data.buyPrice !== undefined) updateData.buyPrice = data.buyPrice;
	if (data.rentPricePerHour !== undefined) updateData.rentPricePerHour = data.rentPricePerHour;
	if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;

	await updateDoc(accountRef, updateData);
};

/**
 * 8. XÓA ACCOUNT
 * @param accountId ID của account cần xóa
 */
export const deleteAccount = async (accountId: string) => {
	const app = getApp();
	const auth = getAuth(app);
	const currentUser = auth.currentUser;
	if (!currentUser) throw new Error("Vui lòng đăng nhập");

	const db = getFirestore(app);
	const accountRef = doc(collection(db, ACCOUNTS_COLL), accountId);

	// Kiểm tra quyền sở hữu
	const accountDoc = await getDoc(accountRef);
	if (!accountDoc.exists()) {
		throw new Error("Tài khoản không tồn tại");
	}

	const accountData = accountDoc.data() as LolAccount;
	if (accountData.sellerId !== currentUser.uid) {
		throw new Error("Bạn không có quyền xóa tài khoản này");
	}

	await deleteDoc(accountRef);
};
