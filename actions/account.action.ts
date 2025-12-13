import type { AccountStatus, LolAccount } from "@/types";
import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import {
	Timestamp,
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
	writeBatch,
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
	if (data.blueEssence !== undefined) cleanData.blueEssence = data.blueEssence;
	if (data.orangeEssence !== undefined) cleanData.orangeEssence = data.orangeEssence;
	if (data.rp !== undefined) cleanData.rp = data.rp;
	if (data.honorLevel !== undefined) cleanData.honorLevel = data.honorLevel;
	if (data.masteryPoints !== undefined) cleanData.masteryPoints = data.masteryPoints;
	if (data.soloRank) cleanData.soloRank = data.soloRank;
	if (data.flexRank) cleanData.flexRank = data.flexRank;
	if (data.tftRank) cleanData.tftRank = data.tftRank;
	if (data.loginUsername) cleanData.loginUsername = data.loginUsername;
	if (data.loginPassword) cleanData.loginPassword = data.loginPassword;
	if (data.buyPrice !== undefined) cleanData.buyPrice = data.buyPrice;
	if (data.rentPricePerHour !== undefined) cleanData.rentPricePerHour = data.rentPricePerHour;
	if (data.thumbnailUrl) cleanData.thumbnailUrl = data.thumbnailUrl;

	const docRef = await addDoc(accountsRef, cleanData);
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
 * 3b. LẤY THÔNG TIN ĐĂNG NHẬP ACCOUNT SAU KHI ĐÃ THANH TOÁN
 * Chỉ trả về credentials nếu user đã mua/thuê account này
 */
export const getAccountCredentials = async (
	accountId: string,
): Promise<{ username: string; password: string } | null> => {
	const app = getApp();
	const db = getFirestore(app);
	const auth = getAuth(app);
	const currentUser = auth.currentUser;

	if (!currentUser) {
		throw new Error("Vui lòng đăng nhập");
	}

	// Check if user has a paid order for this account
	const ordersRef = collection(db, "orders");
	const q = query(
		ordersRef,
		where("buyerId", "==", currentUser.uid),
		where("status", "==", "paid")
	);

	const snapshot = await getDocs(q);
	let hasAccess = false;

	// Check if any order contains this account
	for (const docSnap of snapshot.docs) {
		const orderData = docSnap.data() as any;
		if (orderData.items && Array.isArray(orderData.items)) {
			for (const item of orderData.items) {
				if (item.accountId === accountId) {
					hasAccess = true;
					break;
				}
			}
		}
		if (hasAccess) break;
	}

	if (!hasAccess) {
		throw new Error("Bạn chưa có quyền truy cập thông tin đăng nhập của tài khoản này");
	}

	// Get account with credentials
	const accountRef = doc(collection(db, ACCOUNTS_COLL), accountId);
	const accountDoc = await getDoc(accountRef);

	if (!accountDoc.exists()) {
		throw new Error("Tài khoản không tồn tại");
	}

	const accountData = accountDoc.data() as LolAccount;

	if (!accountData.loginUsername || !accountData.loginPassword) {
		throw new Error("Tài khoản chưa có thông tin đăng nhập");
	}

	return {
		username: accountData.loginUsername,
		password: accountData.loginPassword,
	};
};

/**
 * 4. TÌM KIẾM NÂNG CAO (Query Nested Object)
 * @param filters Filter values object
 */
export const filterAccounts = async (filters: {
	rankTier?: string;
	minPrice?: number;
	maxPrice?: number;
	minSkinCount?: number;
	maxSkinCount?: number;
	minLevel?: number;
	maxLevel?: number;
}) => {
	const app = getApp();
	const db = getFirestore(app);
	const accountsRef = collection(db, ACCOUNTS_COLL);

	const constraints = [where("status", "==", "available")];

	// Query vào Nested Object: dùng dấu chấm "."
	// Lưu ý: Cần tạo Index trên Firestore Console cho các field được filter
	
	// Track which field has inequality operator (for orderBy requirement)
	let inequalityField: string | null = null;

	if (filters.rankTier) {
		constraints.push(where("soloRank.tier", "==", filters.rankTier));
	}

	if (filters.minPrice !== undefined) {
		constraints.push(where("buyPrice", ">=", filters.minPrice));
		inequalityField = "buyPrice";
	}

	if (filters.maxPrice !== undefined) {
		constraints.push(where("buyPrice", "<=", filters.maxPrice));
		inequalityField = "buyPrice";
	}

	if (filters.minSkinCount !== undefined) {
		constraints.push(where("skinCount", ">=", filters.minSkinCount));
		inequalityField = "skinCount";
	}

	if (filters.maxSkinCount !== undefined) {
		constraints.push(where("skinCount", "<=", filters.maxSkinCount));
		inequalityField = "skinCount";
	}

	if (filters.minLevel !== undefined) {
		constraints.push(where("level", ">=", filters.minLevel));
		inequalityField = "level";
	}

	if (filters.maxLevel !== undefined) {
		constraints.push(where("level", "<=", filters.maxLevel));
		inequalityField = "level";
	}

	// Firestore requirement: If using inequality operators, the field must be first in orderBy
	// If no inequality, we can order by createdAt
	if (inequalityField) {
		constraints.push(orderBy(inequalityField, "asc"));
		// Can add secondary sort by createdAt if needed (requires composite index)
		// constraints.push(orderBy("createdAt", "desc"));
	} else {
		constraints.push(orderBy("createdAt", "desc"));
	}

	const q = query(accountsRef, ...constraints);
	const snapshot = await getDocs(q);

	// Sort by createdAt desc in memory if we had to use inequality field for orderBy
	let accounts = snapshot.docs.map((docSnap) =>
		stripSensitiveData({ id: docSnap.id, ...docSnap.data() } as LolAccount),
	);

	// If we used inequality field for orderBy, sort by createdAt in memory
	if (inequalityField) {
		accounts.sort((a, b) => {
			const aTime = a.createdAt?.toMillis() || 0;
			const bTime = b.createdAt?.toMillis() || 0;
			return bTime - aTime; // desc
		});
	}

	return accounts;
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
	if (data.blueEssence !== undefined) updateData.blueEssence = data.blueEssence;
	if (data.orangeEssence !== undefined) updateData.orangeEssence = data.orangeEssence;
	if (data.rp !== undefined) updateData.rp = data.rp;
	if (data.honorLevel !== undefined) updateData.honorLevel = data.honorLevel;
	if (data.masteryPoints !== undefined) updateData.masteryPoints = data.masteryPoints;
	if (data.soloRank !== undefined) updateData.soloRank = data.soloRank;
	if (data.flexRank !== undefined) updateData.flexRank = data.flexRank;
	if (data.tftRank !== undefined) updateData.tftRank = data.tftRank;
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

/**
 * 10. CẬP NHẬT TRẠNG THÁI ACCOUNT KHI HẾT HẠN THUÊ
 * Tự động chuyển status từ "renting" về "available" khi rentEndDate đã qua
 */
export const updateExpiredRentals = async () => {
	const app = getApp();
	const db = getFirestore(app);
	const ordersRef = collection(db, "orders");

	// Lấy tất cả orders có status "paid" và transactionType "rent" mà đã hết hạn
	const now = new Date();
	const nowTimestamp = Timestamp.fromDate(now);

	const q = query(
		ordersRef,
		where("status", "==", "paid"),
		orderBy("createdAt", "desc")
	);

	const snapshot = await getDocs(q);
	const expiredOrders: string[] = [];
	const accountIdsToUpdate: string[] = [];

	snapshot.docs.forEach((docSnap) => {
		const orderData = docSnap.data() as any;
		
		// Check từng item trong order
		if (orderData.items && Array.isArray(orderData.items)) {
			orderData.items.forEach((item: any) => {
				if (item.transactionType === "rent" && item.rentEndDate) {
					const rentEndDate = item.rentEndDate.toDate();
					
					// Nếu đã hết hạn
					if (rentEndDate <= now) {
						expiredOrders.push(docSnap.id);
						if (item.accountId) {
							accountIdsToUpdate.push(item.accountId);
						}
					}
				}
			});
		}
	});

	// Update accounts status từ "renting" về "available"
	if (accountIdsToUpdate.length > 0) {
		const batch = writeBatch(db);
		const uniqueAccountIds = [...new Set(accountIdsToUpdate)];

		for (const accountId of uniqueAccountIds) {
			const accountRef = doc(collection(db, ACCOUNTS_COLL), accountId);
			batch.update(accountRef, { status: "available" });
		}

		await batch.commit();
	}

	return {
		updatedCount: accountIdsToUpdate.length,
		accountIds: [...new Set(accountIdsToUpdate)],
	};
};

/**
 * 9. LẤY DANH SÁCH ACCOUNT CÓ THỂ CHO THUÊ (Có rentPricePerHour)
 */
export const getRentableAccounts = async () => {
	const app = getApp();
	const db = getFirestore(app);
	const accountsRef = collection(db, ACCOUNTS_COLL);

	// Cập nhật các account đã hết hạn thuê trước khi lấy danh sách
	await updateExpiredRentals();

	// Lấy tất cả accounts có rentPricePerHour > 0
	// Lưu ý: Cần tạo Index trên Firestore Console cho 'rentPricePerHour'
	const q = query(
		accountsRef,
		where("rentPricePerHour", ">", 0),
		orderBy("rentPricePerHour", "asc")
	);

	const snapshot = await getDocs(q);

	const accounts = snapshot.docs.map((docSnap) => {
		const data = { id: docSnap.id, ...docSnap.data() } as LolAccount;
		return stripSensitiveData(data);
	});

	return accounts;
};

/**
 * LẤY TẤT CẢ ACCOUNTS (Admin only)
 */
export const getAllAccounts = async (): Promise<LolAccount[]> => {
	const app = getApp();
	const db = getFirestore(app);
	const accountsRef = collection(db, ACCOUNTS_COLL);

	const q = query(accountsRef, orderBy("createdAt", "desc"));
	const snapshot = await getDocs(q);

	return snapshot.docs.map((docSnap) => {
		const data = { id: docSnap.id, ...docSnap.data() } as LolAccount;
		// Admin có thể thấy tất cả thông tin, không cần strip sensitive data
		return data;
	});
};
