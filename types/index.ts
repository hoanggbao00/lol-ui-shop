import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

// --- ENUMS ---
export type UserRole = "admin" | "user";
export type TransactionType = "deposit" | "withdraw";
export type TransactionStatus = "pending" | "completed" | "cancelled";
export type AccountStatus = "available" | "sold" | "renting" | "hidden";
export type OrderStatus =
	| "pending"
	| "paid"
	| "renting"
	| "completed"
	| "refunded"
	| "cancelled";
export type OrderDetailType = "purchase" | "rent";

// --- INTERFACES ---

export interface User {
	uid: string; // Map từ user_id (nhưng dùng Auth UID)
	username: string;
	email: string;
	avatarUrl: string;
	phone?: string;
	role: UserRole;
	balance: number;
	bankName?: string;
	bankAccountNumber?: string;
	bankAccountHolder?: string;
	createdAt: FirebaseFirestoreTypes.Timestamp;
	isActive: boolean;
}

export interface WalletTransaction {
	id?: string;
	userId: string;
	amount: number;
	type: TransactionType;
	method: string;
	status: TransactionStatus;
	transactionCode?: string;
	adminNote?: string;
	createdAt: FirebaseFirestoreTypes.Timestamp;
	updatedAt?: FirebaseFirestoreTypes.Timestamp;
}

export interface LolAccount {
	id?: string;
	sellerId: string;
	// Required
	title: string;
	level: number;
	thumbnailUrl: string;
	// Optional
	ingameName?: string;
	description?: string;
	server?: string;
	region?: string;
	// Stats
	champCount?: number;
	skinCount?: number;
	// Ranks (Gộp các trường rank solo/flex vào object cho gọn)
	soloRank?: { tier: string; division: string; lp: number; wins: number };
	flexRank?: { tier: string; division: string; lp: number; wins: number };
	// Login Info (Nên bảo mật kỹ, chỉ trả về khi đã mua)
	loginUsername?: string;
	loginPassword?: string;
	// Prices
	buyPrice?: number;
	rentPricePerHour?: number;
	status: AccountStatus;
  
	createdAt: FirebaseFirestoreTypes.Timestamp;
}

// Order bao gồm luôn OrderDetails (items)
export interface OrderItem {
	accountId: string;
	transactionType: OrderDetailType;
	price: number;
	rentDurationHours?: number;
	rentEndDate?: FirebaseFirestoreTypes.Timestamp;
	// Snapshot dữ liệu account tại thời điểm mua để lịch sử hiển thị đúng
	accountTitleSnapshot?: string;
}

export interface Order {
	id?: string;
	buyerId: string;
	totalAmount: number;
	status: OrderStatus;
	items: OrderItem[]; // Thay thế bảng OrderDetails
	createdAt: FirebaseFirestoreTypes.Timestamp;
	updatedAt?: FirebaseFirestoreTypes.Timestamp;
}

export interface CartItem {
	id?: string;
	userId: string;
	accountId: string;
	type: OrderDetailType;
	rentDuration: number;
	createdAt: FirebaseFirestoreTypes.Timestamp;
}
