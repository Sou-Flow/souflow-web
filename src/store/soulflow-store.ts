// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { create } from "zustand";
import { persist } from "zustand/middleware";
// import { defaultFlowers } from "@/lib/data/default-flowers";
import { defaultLocations } from "@/lib/data/default-locations";
import type { UserFE } from "@/types/auth.type";
import type {
	//BespokeConsultationResponse,
	CartItem,
	Flower,
	FlowerSize,
	Order,
	UserProfile,
	VietnamCity,
} from "@/types/soulflow";

interface SoulFlowStoreState {
	cart: CartItem[];
	addToCart: (flower: Flower, size: FlowerSize) => void;
	removeFromCart: (cartItemId: string) => void;
	updateCartQuantity: (cartItemId: string, quantity: number) => void;
	clearCart: () => void;
	user: UserFE | null;
	setUser: (userData: UserFE | null) => void;
	clearUser: () => void;
	updateUser: (profile: Partial<UserProfile>) => void;
	orders: Order[];
	placeOrder: (shippingDetails: {
		recipientName: string;
		recipientPhone: string;
		address: string;
		city: string;
		district: string;
		paymentMethod: "VNPAY" | "MoMo" | "Bank Transfer";
	}) => Order;
	flowers: Flower[];
	loadingFlowers: boolean;
	fetchFlowers: () => Promise<void>;
	locationData: VietnamCity[];
	fetchLocationData: () => Promise<void>;
	//bespokeConsultationResult: BespokeConsultationResponse | null;
	loadingConsultation: boolean;
	// submitBespokeRequest: (requestData: {
	// 	budget: number;
	// 	tone: string;
	// 	occasion: string;
	// 	floristMessage: string;
	// 	includeArrangementVase: boolean;
	// }) => Promise<void>;
	couponCode: string;
	appliedCoupon: { code: string; discountPercent: number } | null;
	applyCoupon: (code: string) => boolean;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedCategory: number | null;
	setSelectedCategory: (category: number | null) => void;
}

// const defaultUser: UserProfile = {
// 	name: "ELEANOR VANCE",
// 	email: "eleanor.vance@vogue.fr",
// 	phone: "+84 90 123 4567",
// 	membershipLevel: "Gold",
// 	joinedDate: "Jan 15, 2026",
// 	avatar:
// 		"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
// 	allowNotifications: true,
// };

const defaultOrders: Order[] = [
	{
		id: "SF-10825",
		date: "May 10, 2026",
		recipientName: "Genevieve Beauchamp",
		recipientPhone: "+84 91 999 8888",
		address: "15 Thảo Điền, Thảo Điền Ward",
		city: "Hồ Chí Minh",
		district: "Quận 2",
		paymentMethod: "VNPAY",
		items: [
			{
				flowerId: "parisian-rose",
				flowerName: "The Parisian Rose Bouquet",
				size: "M",
				price: 120,
				quantity: 1,
			},
		],
		totalAmount: 120,
		status: "Delivered",
	},
	{
		id: "SF-10492",
		date: "Apr 22, 2026",
		recipientName: "Eleanor Vance",
		recipientPhone: "+84 90 123 4567",
		address: "88 Đồng Khởi, Bến Nghé Ward",
		city: "Hồ Chí Minh",
		district: "Quận 1",
		paymentMethod: "Bank Transfer",
		items: [
			{
				flowerId: "dried-lavender",
				flowerName: "Provence Lavender Harvest",
				size: "S",
				price: 45,
				quantity: 2,
			},
		],
		totalAmount: 90,
		status: "Delivered",
	},
];

// function buildFallbackConsultation(requestData: {
// 	budget: number;
// 	tone: string;
// }): BespokeConsultationResponse {
// 	const tone = requestData.tone;
// 	return {
// 		bouquetName: `Maison Jardin: ${tone} Dreamscape`,
// 		aestheticDescription: `A masterfully styled floral centerpiece customized to your requested setting, aligned with a budget of $${requestData.budget}.`,
// 		suggestedBlooms: [
// 			{
// 				name:
// 					tone === "Moody"
// 						? "Black Pearl Rose"
// 						: "Juliet Peach David Austin Rose",
// 				reasoning:
// 					"Gives the primary sculptural focus and sets the emotional anchor of the display.",
// 				symbolism: "Sublime passion, mystery, and bespoke handcrafted luxury.",
// 			},
// 			{
// 				name: "French Lace Hydrangeas",
// 				reasoning: "Adds volume and texture while staying within budget.",
// 				symbolism: "Grace, gratitude, and abundance.",
// 			},
// 			{
// 				name: "Silver Eucalyptus Sprigs",
// 				reasoning: "Creates natural movement and releases subtle oils.",
// 				symbolism: "Healing pathways and wild resilience.",
// 			},
// 		],
// 		floristGuideText:
// 			"FLORIST CARE NOTE: Condition stems in fresh floral food before wiring the centerpiece in spiral form.",
// 		moodPalette:
// 			tone === "Pastel"
// 				? ["#F7D6C8", "#E1E9D5", "#FFF5EA"]
// 				: tone === "Vibrant"
// 					? ["#D9381E", "#F2A03D", "#AA4B6B"]
// 					: tone === "White/Neutral"
// 						? ["#F4F1EA", "#D6D1C6", "#A2A997"]
// 						: ["#2A1A1F", "#4C3B3F", "#141E30"],
// 	};
// }

export const useSoulFlowStore = create<SoulFlowStoreState>()(
	persist((set, get) => ({
		cart: [],
		addToCart: (flower) => {
			const existing = get().cart.find((item) => item.id);

			let updatedCart: CartItem[];
			if (existing) {
				updatedCart = get().cart.map((item) => item.id);
			} else {
				updatedCart = [
					...get().cart,
					{
						flower,
						quantity: 1,
					},
				];
			}
			set({ cart: updatedCart });
		},
		removeFromCart: (cartItemId) => {
			set({ cart: get().cart.filter((item) => item.id !== cartItemId) });
		},
		updateCartQuantity: (cartItemId, quantity) => {
			if (quantity <= 0) {
				get().removeFromCart(cartItemId);
				return;
			}
			set({
				cart: get().cart.map((item) =>
					item.id === cartItemId ? { ...item, quantity } : item,
				),
			});
		},
		clearCart: () => set({ cart: [] }),

		user: null, // Khởi tạo chưa đăng nhập
		setUser: (userData: UserFE | null) => set({ user: userData }),
		clearUser: () => set({ user: null }),

		// Tạm thời dùng defaultUser để dễ test, sau này sẽ xóa đi khi có auth thực sự
		updateUser: (profile) =>
			set({ user: { ...get().user, ...profile } as UserFE }),

		orders: defaultOrders,
		placeOrder: (details) => {
			const orderItems = get().cart.map((item) => ({
				flowerId: item.flower.id,
				flowerName: item.flower.name,
				size: item.selectedSize,
				price: item.priceUnit,
				quantity: item.quantity,
			}));

			const subtotal = get().cart.reduce(
				(sum, item) => sum + item.priceUnit * item.quantity,
				0,
			);
			const coupon = get().appliedCoupon;
			const discount = coupon ? (subtotal * coupon.discountPercent) / 100 : 0;
			const totalAmount = subtotal - discount + 5;

			const newOrder: Order = {
				id: `SF-${Math.floor(10000 + Math.random() * 90000)}`,
				date: new Date().toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					year: "numeric",
				}),
				...details,
				items: orderItems,
				totalAmount,
				status: "In Prep",
			};

			set((state) => ({
				orders: [newOrder, ...state.orders],
				cart: [],
				appliedCoupon: null,
			}));

			return newOrder;
		},

		flowers: defaultOrders,
		// loadingFlowers: false,
		// fetchFlowers: async () => {
		// 	set({ loadingFlowers: true });
		// 	try {
		// 		const response = await fetch("/api/flowers");
		// 		if (!response.ok) {
		// 			throw new Error("Failed to load flowers");
		// 		}
		// 		const data = (await response.json()) as Flower[];
		// 		set({ flowers: data, loadingFlowers: false });
		// 	} catch {
		// 		set({ loadingFlowers: false });
		// 	}
		// },

		locationData: defaultLocations,
		fetchLocationData: async () => {
			try {
				const response = await fetch("/api/locations");
				if (!response.ok) {
					throw new Error("Failed to load locations");
				}
				const data = (await response.json()) as VietnamCity[];
				set({ locationData: data });
			} catch {
				// Keep default Vietnam city data
			}
		},

		bespokeConsultationResult: null,
		loadingConsultation: false,
		// submitBespokeRequest: async (requestData) => {
		// 	set({ loadingConsultation: true, bespokeConsultationResult: null });
		// 	try {
		// 		const response = await fetch("/api/gemini/consult", {
		// 			method: "POST",
		// 			headers: { "Content-Type": "application/json" },
		// 			body: JSON.stringify(requestData),
		// 		});
		// 		if (!response.ok) {
		// 			throw new Error("Consultation request failed");
		// 		}
		// 		const result = (await response.json()) as BespokeConsultationResponse;
		// 		set({
		// 			bespokeConsultationResult: result,
		// 			loadingConsultation: false,
		// 		});
		// 	} catch {
		// 		set({
		// 			loadingConsultation: false,
		// 			bespokeConsultationResult: buildFallbackConsultation(requestData),
		// 		});
		// 	}
		// },

		couponCode: "",
		appliedCoupon: null,
		applyCoupon: (code) => {
			const match = code.toUpperCase().trim();
			if (
				match === "SOULWINTER" ||
				match === "SOULFLORIST" ||
				match === "BOSCFLOW"
			) {
				set({ appliedCoupon: { code: match, discountPercent: 15 } });
				return true;
			}
			return false;
		},
		searchQuery: "",
		setSearchQuery: (query) => set({ searchQuery: query }),
		selectedCategory: null,
		setSelectedCategory: (category) => set({ selectedCategory: category }),
	})),
);
