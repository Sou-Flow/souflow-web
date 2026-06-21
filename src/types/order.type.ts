export interface Order {
	id: string;
	date: string;
	recipientName: string;
	recipientPhone: string;
	address: string;
	district: string;
	city: string;
	paymentMethod: "VNPAY" | "MoMo" | "Bank Transfer";
	totalAmount: number;
}
