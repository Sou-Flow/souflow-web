export interface Flower {
	id: string;
	name: string;
	scientificName: string;
	priceSmall: number;
	priceMedium: number;
	priceLarge: number;
	description: string;
	category: string;
	symbolism: string;
	careGuide: string;
	image: string;
	popular: boolean;
}

export type FlowerSize = "S" | "M" | "L";

export interface CartItem {
	id: string; // unique item id inside cart: product_id + '-' + size
	flower: Flower;
	selectedSize: FlowerSize;
	quantity: number;
	priceUnit: number;
}

export interface Order {
	id: string;
	date: string;
	recipientName: string;
	recipientPhone: string;
	address: string;
	city: string;
	district: string;
	paymentMethod: "VNPAY" | "MoMo" | "Bank Transfer";
	items: Array<{
		flowerId: string;
		flowerName: string;
		size: FlowerSize;
		price: number;
		quantity: number;
	}>;
	totalAmount: number;
	status: "In Prep" | "Dispatched" | "Delivered" | "Cancelled";
}

export interface UserProfile {
	fullName: string;
	email: string;
	phone: string;
	membershipLevel: "Bronze" | "Silver" | "Gold" | "Platinum";
	joinedDate: string;
	avatar: string;
	allowNotifications: boolean;
}

// export interface BespokeConsultationRequest {
// 	budget: number;
// 	tone: "Pastel" | "Vibrant" | "White/Neutral" | "Moody";
// 	occasion: string;
// 	floristMessage: string;
// 	includeArrangementVase: boolean;
// }

// export interface BespokeConsultationResponse {
// 	bouquetName: string;
// 	aestheticDescription: string;
// 	suggestedBlooms: Array<{
// 		name: string;
// 		reasoning: string;
// 		symbolism: string;
// 	}>;
// 	floristGuideText: string;
// 	moodPalette: string[];
// }

export interface VietnamCity {
	code: string;
	name: string;
	districts: string[];
}
