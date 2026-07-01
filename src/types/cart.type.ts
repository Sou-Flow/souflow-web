// src/types/cart.type.ts

import type { CartItemFE as CartItemFE_Base } from "./order.type";
import { mapProductResponseToFE } from "./product.type";

/**
 * Matches CartItemResponse.java:
 *   id          → items.pk  (the cart item row's own PK)
 *   productId   → items.product_pk
 *   productNameVn / productNameEng / productPrice  (flat, no nested product object)
 */
export interface CartItemResponseDTO {
	pk: number; // items.pk — used for DELETE /carts/{cartId}/items/{pk}
	productId: number; // products.pk — used for POST add/increment
	productNameVn: string;
	productNameEng: string;
	productPrice: number;
	quantity: number;
	subtotal: number;
}

/**
 * Matches CartResponse.java:
 *   id          → carts.pk  (numeric, used in URL paths)
 *   businessId  → carts.id  (string like "CART-XXXX")
 */
export interface CartResponseDTO {
	pk: number; // carts.pk (numeric) — used in API URL /carts/{pk}/items
	businessId: string; // carts.id (string business key)
	total: number;
	expired: boolean;
	expiredDate: string;
	createdDate: string;
	items: CartItemResponseDTO[];
}

/**
 * CartItemFE — adds itemPk so we can call DELETE /carts/{cartId}/items/{itemPk}
 */
export interface CartItemFE extends CartItemFE_Base {
	itemPk: number; // items.pk — needed for removeItemFromCart
}

// Map CartItemResponseDTO / ItemResponse → CartItemFE
export const mapCartItemResponseToFE = (
	dto: Record<string, unknown>,
): CartItemFE => {
	const itemPk = dto.pk ?? dto.id ?? dto.itemPk ?? dto.cartItemId;
	const productId =
		dto.productId ??
		dto.productPk ??
		dto.product_pk ??
		(dto.product as any)?.pk ??
		(dto.product as any)?.id ??
		0;

	return {
		itemPk: itemPk ? Number(itemPk) : 0,
		product: mapProductResponseToFE(
			(dto.product as any) ||
				({
					pk: productId,
					nameVn: (dto as any).productNameVn || (dto as any).name || "Sản phẩm",
					nameEng:
						(dto as any).productNameEng || (dto as any).name || "Product",
					price: (dto as any).productPrice || (dto as any).price || 0,
				} as any),
		),
		quantity: Number(dto.quantity || 1),
	};
};
