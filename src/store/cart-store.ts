import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { create } from "zustand";
import { cartService } from "@/services/cartService";
import { productService } from "@/services/productService";
import { useDiscountStore } from "@/store/discount-store";
import { mapCartItemResponseToFE } from "@/types/cart.type";
import type { CartItemFE } from "@/types/order.type";
import type { ProductFE } from "@/types/product.type";

interface CartState {
	cartId: number | null;
	cart: CartItemFE[];
	isLoading: boolean;

	// Các Actions
	fetchCart: () => Promise<void>;
	addToCart: (product: ProductFE, quantity?: number) => Promise<void>;
	removeFromCart: (productId: number) => Promise<void>;
	updateCartQuantity: (productId: number, quantity: number) => Promise<void>;
	clearCart: () => Promise<void>;
	clearCartState: () => void;
	recreateCart: () => Promise<void>;
	revalidateCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()((set, get) => ({
	cartId: null,
	cart: [],
	isLoading: false,

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

			const activeCarts = (carts ?? []).filter((c) => {
				// biome-ignore lint/suspicious/noExplicitAny: skip
				const cId = Number(c.pk || (c as any).id || (c as any).cartId);
				return !c.expired && !deadCarts.includes(cId);
			});

			if (activeCarts.length > 0) {
				// Chọn giỏ hàng mới nhất
				const currentCart = activeCarts[activeCarts.length - 1];
				// biome-ignore lint/suspicious/noExplicitAny: skip
				const rawItems =
					(currentCart as any).items ||
					(currentCart as any).itemResponses ||
					[];
				const mappedItems: CartItemFE[] = rawItems.map(
					// biome-ignore lint/suspicious/noExplicitAny: skip
					(item: any) => mapCartItemResponseToFE(item),
				);

				const deduplicatedItems: CartItemFE[] = [];
				for (const item of mappedItems) {
					const existing = deduplicatedItems.find(
						(i) => i.product.id === item.product.id,
					);
					if (existing) {
						existing.quantity += item.quantity;
					} else {
						deduplicatedItems.push(item);
					}
				}

				set({
					cartId: Number(
						// biome-ignore lint/suspicious/noExplicitAny: skip
						currentCart.pk ||
							(currentCart as any).id ||
							(currentCart as any).cartId,
					),
					cart: deduplicatedItems,
					isLoading: false,
				});

				// Đồng bộ tồn kho ngay sau khi fetch
				await get().revalidateCart();
			} else {
				const newCart = await cartService.createCart();
				if (newCart) {
					set({ cartId: newCart.pk, cart: [], isLoading: false });
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
			// Lấy giỏ hàng hiện tại và thêm/cập nhật sản phẩm, gộp các item bị trùng
			const currentItems: {
				pk: number | null;
				productId: number;
				quantity: number;
			}[] = [];
			for (const item of get().cart) {
				const existing = currentItems.find(
					(i) => i.productId === item.product.id,
				);
				if (existing) {
					existing.quantity += item.quantity;
				} else {
					currentItems.push({
						pk: item.itemPk || null,
						productId: item.product.id,
						quantity: item.quantity,
					});
				}
			}

			const existingItemIndex = currentItems.findIndex(
				(i) => i.productId === Number(product.id),
			);
			if (existingItemIndex >= 0) {
				currentItems[existingItemIndex].quantity += quantity;
			} else {
				currentItems.push({
					pk: null,
					productId: Number(product.id),
					quantity,
				});
			}

			// Gửi toàn bộ giỏ hàng lên BE
			const updatedCartDTO = await cartService.saveCart(
				activeCartId,
				currentItems,
			);

			// Tối ưu hóa: Dùng trực tiếp dữ liệu trả về từ BE thay vì gọi thêm 2 API fetchCart và revalidateCart
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const rawItems =
				(updatedCartDTO as any)?.items ||
				(updatedCartDTO as any)?.itemResponses;
			if (rawItems) {
				const mappedItems = rawItems.map((item: Record<string, unknown>) => {
					const mapped = mapCartItemResponseToFE(item);
					// Preserve existing product details to prevent UI flicker
					const existingItem = get().cart.find(
						(i) => i.product.id === mapped.product.id,
					);
					if (existingItem) {
						mapped.product = existingItem.product;
					} else if (mapped.product.id === product.id) {
						// For the newly added item, preserve the product details passed into addToCart
						mapped.product = product;
					}
					return mapped;
				});

				// Deduplicate in case backend returns duplicated rows
				const deduplicatedItems: CartItemFE[] = [];
				for (const item of mappedItems) {
					const existing = deduplicatedItems.find(
						(i) => i.product.id === item.product.id,
					);
					if (existing) {
						existing.quantity += item.quantity;
					} else {
						deduplicatedItems.push(item);
					}
				}

				set({ cart: deduplicatedItems });
				// Đồng bộ lại chi tiết sản phẩm (hình ảnh, tồn kho thật) từ BE
				await get().revalidateCart();
			}

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
						await cartService.saveCart(newCartId, [
							{ pk: null, productId: Number(product.id), quantity: quantity },
						]);
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
			// BE yêu cầu lưu lại toàn bộ giỏ hàng với danh sách items mới
			const currentItems: {
				pk: number | null;
				productId: number;
				quantity: number;
			}[] = [];
			for (const item of cart.filter((item) => item.product.id !== productId)) {
				const existing = currentItems.find(
					(i) => i.productId === item.product.id,
				);
				if (existing) {
					existing.quantity += item.quantity;
				} else {
					currentItems.push({
						pk: item.itemPk || null,
						productId: item.product.id,
						quantity: item.quantity,
					});
				}
			}

			const updatedCartDTO = await cartService.saveCart(cartId, currentItems);
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const rawItems =
				(updatedCartDTO as any)?.items ||
				(updatedCartDTO as any)?.itemResponses;
			if (rawItems) {
				const mappedItems = rawItems.map((item: Record<string, unknown>) =>
					mapCartItemResponseToFE(item),
				);

				const deduplicatedItems: CartItemFE[] = [];
				for (const item of mappedItems) {
					const existing = deduplicatedItems.find(
						(i) => i.product.id === item.product.id,
					);
					if (existing) {
						existing.quantity += item.quantity;
					} else {
						deduplicatedItems.push(item);
					}
				}

				set({ cart: deduplicatedItems });
				await get().revalidateCart();
			} else {
				set({ cart: cart.filter((item) => item.product.id !== productId) });
			}
			toast.success("Đã xóa sản phẩm khỏi giỏ hàng", { id: toastId });
			const discountStore = useDiscountStore.getState();
			if (discountStore.couponCode) {
				const currentCart = get().cart;
				const currentSubtotal = currentCart.reduce(
					(sum, item) =>
						sum + (item.product?.price || 0) * (item.quantity || 1),
					0,
				);
				await discountStore.checkAndApplyDiscount(
					discountStore.couponCode,
					currentSubtotal,
				);
			}
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

		if (delta > 0 || delta < 0) {
			try {
				const currentItems: {
					pk: number | null;
					productId: number;
					quantity: number;
				}[] = [];
				for (const item of cart) {
					const existing = currentItems.find(
						(i) => i.productId === item.product.id,
					);
					const itemQty =
						item.product.id === productId ? quantity : item.quantity;

					if (existing) {
						// Nếu đang xử lý sản phẩm trùng ID, ta gán luôn quantity mới để đè lên rác cũ
						if (item.product.id === productId) {
							existing.quantity = quantity;
						} else {
							existing.quantity += itemQty;
						}
					} else {
						currentItems.push({
							pk: item.itemPk || null,
							productId: item.product.id,
							quantity: itemQty,
						});
					}
				}

				const updatedCartDTO = await cartService.saveCart(cartId, currentItems);
				// biome-ignore lint/suspicious/noExplicitAny: skip
				const rawItems =
					(updatedCartDTO as any)?.items ||
					(updatedCartDTO as any)?.itemResponses;
				if (rawItems) {
					const mappedItems = rawItems.map((item: Record<string, unknown>) => {
						const mapped = mapCartItemResponseToFE(item);
						// Preserve existing product details (image, stockQuantity, etc.) to prevent UI flicker
						const existingItem = get().cart.find(
							(i) => i.product.id === mapped.product.id,
						);
						if (existingItem) {
							mapped.product = existingItem.product;
						}
						return mapped;
					});

					const deduplicatedItems: CartItemFE[] = [];
					for (const item of mappedItems) {
						const existing = deduplicatedItems.find(
							(i) => i.product.id === item.product.id,
						);
						if (existing) {
							existing.quantity += item.quantity;
						} else {
							deduplicatedItems.push(item);
						}
					}

					set({ cart: deduplicatedItems });
					// Call revalidateCart asynchronously without blocking, though we just preserved the state
					get().revalidateCart();
				} else {
					set({
						cart: cart.map((item) =>
							item.product.id === productId ? { ...item, quantity } : item,
						),
					});
				}

				const discountStore = useDiscountStore.getState();
				if (discountStore.couponCode) {
					const currentCart = get().cart;
					const currentSubtotal = currentCart.reduce(
						(sum, item) =>
							sum + (item.product?.price || 0) * (item.quantity || 1),
						0,
					);
					await discountStore.checkAndApplyDiscount(
						discountStore.couponCode,
						currentSubtotal,
					);
				}
			} catch (error: unknown) {
				console.error("Lỗi cập nhật số lượng:", error);
				toast.error("Không thể cập nhật số lượng!", { id: "update-error" });
			}
		}
	},

	// 5. XÓA TRẮNG GIỎ HÀNG (DÙNG SAU KHI ĐẶT HÀNG THÀNH CÔNG)
	clearCart: async () => {
		const { cartId } = get();

		// Ngay lập tức reset state về rỗng để UI phản hồi ngay
		set({ cart: [], cartId: null });

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
		set({ cart: [], cartId: null });
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
				// Thêm lại từng sản phẩm vào giỏ hàng mới bằng cách lưu toàn bộ giỏ
				const currentItems = cart.map((item) => ({
					pk: null,
					productId: Number(item.product.id),
					quantity: item.quantity,
				}));
				await cartService.saveCart(newCartId, currentItems);

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
}));
