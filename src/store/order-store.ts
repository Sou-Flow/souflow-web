import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartService } from "@/services/cartService";
import { orderService } from "@/services/orderService";
import type { OrderFE, OrderRequestDTO } from "@/types/order.type";
import { useCartStore } from "./cart-store";

const defaultOrders: OrderFE[] = [];

interface OrderState {
	orders: OrderFE[];
	isPlacingOrder: boolean;
	placeOrder: (shippingDetails: {
		recipientName: string;
		recipientPhone: string;
		address: string;
		city: string;
		district: string;
		paymentMethod: "SEPAY" | "COD" | "STORE";
		shippingFee?: number;
	}) => Promise<OrderFE>;
	clearOrderState: () => void;
}

export const useOrderStore = create<OrderState>()(
	persist(
		(set, _get) => ({
			orders: defaultOrders,
			isPlacingOrder: false,
			clearOrderState: () => set({ orders: [] }),

			placeOrder: async (details) => {
				set({ isPlacingOrder: true });
				const cartState = useCartStore.getState();
				const currentCart = cartState.cart;

				// 1. Dùng trực tiếp address vì CheckoutForm đã encode với ||
				const fullAddress = details.address;

				try {
					let cartId = cartState.cartId;

					// Tự động tạo và đồng bộ nếu trước đó mua dạng Guest nhưng giờ đã Login
					if (!cartId) {
						if (currentCart.length === 0) {
							throw new Error("Giỏ hàng của bạn đang trống.");
						}
						// biome-ignore lint/suspicious/noExplicitAny: skip
						const newCart: any = await cartService.createCart();
						if (newCart) {
							cartId = Number(newCart.id || newCart.pk || newCart.cartId);
							useCartStore.setState({ cartId });

							// Đồng bộ hàng đang có ở local lên BE
							const itemsToSave = currentCart.map((item) => ({
								pk: null,
								productId: Number(item.product.id),
								quantity: item.quantity,
							}));
							await cartService.saveCart(cartId, itemsToSave);
						}
					}

					if (!cartId)
						throw new Error("Không thể đồng bộ giỏ hàng với máy chủ.");

					const payload: OrderRequestDTO = {
						fullname: details.recipientName,
						phone: details.recipientPhone,
						address: fullAddress,
						paymentMethod: details.paymentMethod,
						shippingFee: details.shippingFee,
						orderDetailRequests: currentCart.map((item) => ({
							productPk: Number(item.product.id),
							quantity: item.quantity,
						})),
					};

					// 4. Gọi API thật đẩy xuống Spring Boot
					const newOrder = await orderService.createOrder(payload);

					// Update local state history
					set((state) => ({
						orders: [newOrder, ...state.orders],
						isPlacingOrder: false,
					}));

					return newOrder;
				} catch (error) {
					set({ isPlacingOrder: false });
					console.error("Lỗi khi đặt hàng:", error);
					throw error;
				}
			},
		}),
		{
			name: "souflow-order-storage",
			partialize: (state) => ({ orders: state.orders }), // CHỈ lưu orders, không lưu isPlacingOrder để tránh kẹt loading
		},
	),
);
