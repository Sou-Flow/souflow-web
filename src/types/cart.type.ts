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
	id: number; // items.pk — used for DELETE /carts/{cartId}/items/{id}
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
	id: number; // carts.pk (numeric) — used in API URL /carts/{id}/items
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

// Map CartItemResponseDTO → CartItemFE
export const mapCartItemResponseToFE = (
	dto: CartItemResponseDTO,
): CartItemFE => {
	return {
		itemPk: dto.id, // items.pk stored separately
		product: mapProductResponseToFE({
			id: dto.productId, // CORRECT: product pk, not item pk
			nameVn: dto.productNameVn,
			nameEng: dto.productNameEng,
			price: dto.productPrice,
		}),
		quantity: dto.quantity,
	};
};
