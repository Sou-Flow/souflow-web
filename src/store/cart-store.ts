import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { create } from "zustand";
import { cartService } from "@/services/cartService";
import { discountService } from "@/services/discountService";
import { productService } from "@/services/productService";
import {
	type CartItemResponseDTO,
	mapCartItemResponseToFE,
} from "@/types/cart.type";
import type { DiscountFE } from "@/types/discount.type";
import type { CartItemFE } from "@/types/order.type";
import type { ProductFE } from "@/types/product.type";

interface CartState {
	cartId: number | null;
	cart: CartItemFE[];
	isLoading: boolean;

	// Quản lý mã giảm giá
	couponCode: string;
	appliedCoupon: DiscountFE | null;

	// Các Actions
	fetchCart: () => Promise<void>;
	addToCart: (product: ProductFE, quantity?: number) => Promise<void>;
	removeFromCart: (productId: number) => Promise<void>;
	updateCartQuantity: (productId: number, quantity: number) => Promise<void>;
	clearCart: () => Promise<void>;
	clearCartState: () => void;
	recreateCart: () => Promise<void>;
	revalidateCart: () => Promise<void>;

	applyCoupon: (code: string) => Promise<boolean>;
	removeCoupon: () => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
	cartId: null,
	cart: [],
	isLoading: false,
	couponCode: "",
	appliedCoupon: null,

	// 1. LẤY GIỎ HÀNG TỪ DATABASE KHI VÀO WEB
	fetchCart: async () => {
		set({ isLoading: true });

		const token = Cookies.get("accessToken");
		if (!token) {
			set({ cartId: null, cart: [], isLoading: false });
			return;
		}

		try {
			const carts = await cartService.getCarts();

			// Lấy danh sách các giỏ hàng đã thanh toán bị lưu ở frontend
			let deadCarts: number[] = [];
			if (typeof window !== "undefined") {
				try {
					deadCarts = JSON.parse(localStorage.getItem("sf_dead_carts") || "[]");
				} catch (_e) {}
			}

			// Lọc giỏ hàng chưa hết hạn và không nằm trong blacklist
			const activeCarts = (carts ?? []).filter((c) => {
				const cId = Number(c.id); // CartResponse.id = carts.pk (numeric)
				return !c.expired && !deadCarts.includes(cId);
			});

			if (activeCarts.length > 0) {
				// Chọn giỏ hàng mới nhất
				const currentCart = activeCarts[activeCarts.length - 1];
				const mappedItems: CartItemFE[] = (currentCart.items ?? []).map(
					(item: CartItemResponseDTO) => mapCartItemResponseToFE(item),
				);

				set({
					cartId: currentCart.id, // carts.pk — dùng trong URL /carts/{id}/items
					cart: mappedItems,
					isLoading: false,
				});

				// Đồng bộ tồn kho ngay sau khi fetch
				await get().revalidateCart();
			} else {
				const newCart = await cartService.createCart();
				if (newCart) {
					set({ cartId: newCart.id, cart: [], isLoading: false });
				} else {
					set({ isLoading: false });
				}
			}
		} catch (error) {
			console.error("Lỗi khởi tạo giỏ hàng:", error);
			set({ isLoading: false });
		}
	},

	// 2. THÊM VÀO GIỎ HÀNG (PESSIMISTIC UPDATE)
	addToCart: async (product, quantity = 1) => {
		const { cartId, fetchCart } = get();

		// Kiểm tra tồn kho trước khi gọi API
		const existingItem = get().cart.find(
			(item) => item.product.id === product.id,
		);
		const currentQty = existingItem ? existingItem.quantity : 0;
		if (currentQty + quantity > (product.stockQuantity || 0)) {
			toast.error(
				`Rất tiếc, cửa hàng chỉ còn ${product.stockQuantity} sản phẩm này!`,
			);
			return;
		}

		const toastId = toast.loading("Đang thêm vào giỏ hàng...");

		// Cố gắng fetch/tạo cart nếu chưa có
		let activeCartId = cartId;
		if (!activeCartId) {
			await fetchCart();
			activeCartId = get().cartId;
			if (!activeCartId) {
				toast.error("Không thể tạo giỏ hàng. Vui lòng thử lại sau.", {
					id: toastId,
				});
				return;
			}
		}

		try {
			// BE xử lý cả thêm mới lẫn tăng số lượng thông qua cùng một endpoint POST
			await cartService.addItemToCart(
				activeCartId,
				Number(product.id),
				quantity,
			);

			// Fetch lại giỏ hàng từ backend để chắc chắn đồng bộ `itemPk`
			await fetchCart();

			// Gọi đồng bộ lại tồn kho để đảm bảo giao diện hiển thị đúng tình trạng hiện tại
			await get().revalidateCart();

			toast.success(`Đã thêm ${product.nameVn} vào giỏ hàng!`, { id: toastId });
		} catch (error: unknown) {
			const err = error as { response?: { status?: number } };
			if (err.response?.status === 410 || err.response?.status === 404) {
				console.warn("Lỗi thêm vào giỏ hàng (Hết hạn):", error);
				toast.error("Phiên giỏ hàng đã hết hạn, đang tạo mới...", {
					id: toastId,
				});
				set({ cartId: null, cart: [] });

				try {
					// biome-ignore lint/suspicious/noExplicitAny: skip
					const newCart: any = await cartService.createCart();
					const newCartId = Number(
						newCart?.id || newCart?.pk || newCart?.cartId,
					);

					if (newCartId) {
						set({ cartId: newCartId });
						await cartService.addItemToCart(
							newCartId,
							Number(product.id),
							quantity,
						);
						await fetchCart();
						toast.success(`Đã thêm ${product.nameVn} vào giỏ hàng!`, {
							id: toastId,
						});
					} else {
						toast.error("Không thể tạo giỏ hàng mới. Vui lòng thử lại.", {
							id: toastId,
						});
					}
				} catch (_retryError) {
					toast.error("Vẫn không thể thêm vào giỏ. Vui lòng thử lại.", {
						id: toastId,
					});
				}
			} else {
				console.error("Lỗi thêm vào giỏ hàng:", error);
				toast.error("Đã có lỗi xảy ra khi thêm vào giỏ hàng!", { id: toastId });
			}
		}
	},

	// 3. XÓA KHỎI GIỎ HÀNG (PESSIMISTIC UPDATE)
	removeFromCart: async (productId) => {
		const { cart, cartId } = get();
		if (!cartId) return;

		const currentItem = cart.find((item) => item.product.id === productId);
		if (!currentItem?.itemPk) {
			toast.error("Không tìm thấy thông tin sản phẩm trong giỏ hàng để xóa!");
			return;
		}

		const toastId = toast.loading("Đang xóa sản phẩm...");
		try {
			// BE yêu cầu DELETE /carts/{cartId}/items/{itemId} (với itemId là items.pk chứ không phải products.pk)
			await cartService.removeItemFromCart(cartId, currentItem.itemPk);
			set({ cart: cart.filter((item) => item.product.id !== productId) });
			toast.success("Đã xóa sản phẩm khỏi giỏ hàng", { id: toastId });
		} catch (error: unknown) {
			const err = error as { response?: { status?: number } };
			if (err.response?.status === 410 || err.response?.status === 404) {
				console.warn("Lỗi xóa sản phẩm (Hết hạn):", error);
				toast.success("Giỏ hàng đã được đồng bộ lại.", { id: toastId });
				set({ cartId: null, cart: [] });
				await get().fetchCart();
			} else {
				console.error("Lỗi xóa sản phẩm:", error);
				toast.error("Đã có lỗi xảy ra khi xóa sản phẩm!", { id: toastId });
			}
		}
	},

	// 4. TĂNG/GIẢM SỐ LƯỢNG
	// Backend chỉ có POST (tăng) và DELETE (xóa hẳn item).
	// - Tăng (+): gọi addItemToCart với delta dương
	// - Giảm (-): nếu về 0 thì xóa hẳn, còn lại update local state thôi (chờ BE cấp PUT)
	// TODO: Khi BE có endpoint PUT /carts/{cartId}/items/{productId}, thay thế logic giảm bên dưới
	updateCartQuantity: async (productId, quantity) => {
		if (quantity <= 0) {
			get().removeFromCart(productId);
			return;
		}

		const { cart, cartId } = get();
		if (!cartId) return;

		const currentItem = cart.find((item) => item.product.id === productId);
		if (!currentItem) return;

		// Chặn vượt quá tồn kho
		if (quantity > currentItem.product.stockQuantity) {
			toast.error("Đã đạt giới hạn tồn kho");
			return;
		}

		const currentQuantity = currentItem.quantity ?? 0;
		const delta = quantity - currentQuantity;

		if (delta === 0) return;

		if (delta > 0) {
			// Tăng số lượng: gọi POST với delta dương (quantity >= 1, pass validation)
			try {
				await cartService.addItemToCart(cartId, productId, delta);
				set({
					cart: cart.map((item) =>
						item.product.id === productId ? { ...item, quantity } : item,
					),
				});
			} catch (error: unknown) {
				console.error("Lỗi tăng số lượng:", error);
				toast.error("Không thể cập nhật số lượng!", { id: "update-error" });
			}
		} else {
			// Giảm số lượng: Backend không có PUT, chỉ cập nhật local state
			// Đảm bảo UI phản hồi ngay, số liệu sẽ đồng bộ khi refresh
			set({
				cart: cart.map((item) =>
					item.product.id === productId ? { ...item, quantity } : item,
				),
			});
		}
	},

	// 5. XÓA TRẮNG GIỎ HÀNG (DÙNG SAU KHI ĐẶT HÀNG THÀNH CÔNG)
	clearCart: async () => {
		const { cartId } = get();

		// Ngay lập tức reset state về rỗng để UI phản hồi ngay
		set({ cart: [], appliedCoupon: null, couponCode: "", cartId: null });

		if (cartId) {
			try {
				// Đưa ID này vào danh sách đen ở frontend để không bao giờ lấy lại nữa
				if (typeof window !== "undefined") {
					const deadCarts = JSON.parse(
						localStorage.getItem("sf_dead_carts") || "[]",
					);
					if (!deadCarts.includes(cartId)) {
						deadCarts.push(cartId);
						localStorage.setItem("sf_dead_carts", JSON.stringify(deadCarts));
					}
				}

				// Thử xóa giỏ hàng cũ trên BE
				await cartService.deleteCart(cartId);
			} catch (error) {
				console.warn(
					"Không thể xóa giỏ hàng cũ trên BE (Có thể đã chuyển thành đơn hàng):",
					error,
				);
			}
		}

		// Tạo sẵn một giỏ hàng mới để lần thêm tiếp theo không bị dính giỏ hàng cũ
		try {
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const newCart: any = await cartService.createCart();
			if (newCart) {
				set({ cartId: Number(newCart.id || newCart.pk || newCart.cartId) });
			}
		} catch (error) {
			console.error("Không thể tạo giỏ hàng mới sau khi clear:", error);
		}
	},

	// 6. XÓA TRẮNG CHỈ TRÊN LOCAL (DÙNG KHI LOGOUT)
	clearCartState: () => {
		set({ cart: [], appliedCoupon: null, couponCode: "", cartId: null });
	},

	// 6.1 TÁI TẠO GIỎ HÀNG TỪ LOCAL STATE (KHI ĐƠN HÀNG BỊ HỦY)
	recreateCart: async () => {
		const { cart } = get();
		if (cart.length === 0) return;

		try {
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const newCart: any = await cartService.createCart();
			const newCartId = Number(newCart?.id || newCart?.pk || newCart?.cartId);

			if (newCartId) {
				set({ cartId: newCartId });
				// Thêm lại từng sản phẩm vào giỏ hàng mới
				for (const item of cart) {
					await cartService.addItemToCart(
						newCartId,
						Number(item.product.id),
						item.quantity,
					);
				}
				// Đồng bộ lại với backend
				await get().fetchCart();
			}
		} catch (error) {
			console.error("Lỗi khi tái tạo giỏ hàng:", error);
		}
	},

	// 7. CẬP NHẬT LẠI TỒN KHO TỪ BACKEND
	revalidateCart: async () => {
		const { cart } = get();
		if (cart.length === 0) return;
		try {
			const allFlowers = await productService.getAllFlower();
			const updatedCart = cart.map((item) => {
				const latestProduct = allFlowers.find((f) => f.id === item.product.id);
				if (latestProduct) {
					return { ...item, product: latestProduct };
				}
				return item;
			});
			set({ cart: updatedCart });
		} catch (error) {
			console.error("Lỗi revalidateCart:", error);
		}
	},

	// 8. ÁP DỤNG MÃ GIẢM GIÁ
	applyCoupon: async (code) => {
		const match = code.toUpperCase().trim();
		if (!match) return false;

		try {
			const discountData = await discountService.checkDiscount(match);

			if (discountData && !discountData.isExpired && discountData.isActive) {
				set({ appliedCoupon: discountData, couponCode: match });
				return true;
			}
			return false;
		} catch (_error) {
			console.warn("Mã giảm giá không hợp lệ.");
			return false;
		}
	},

	removeCoupon: () => set({ appliedCoupon: null, couponCode: "" }),
}));
