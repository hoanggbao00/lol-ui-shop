export type OrderStatus =
	| "pending"
	| "paid"
	| "renting"
	| "completed"
	| "refunded"
	| "cancelled";

export type OrderType = "purchase" | "rent";

export interface Order {
	order_id: number;
	user_id: number;
	account_id: number;
	account_firestore_id?: string; // Firestore ID để lấy credentials
	account_name: string;
	account_avatar: string;
	rank: string;
	type: OrderType;
	status: OrderStatus;
	amount: number;
	rent_days?: number;
	rent_end_date?: string;
	created_at: string;
	updated_at: string;
	buyer_name?: string;
	seller_name?: string;
}
