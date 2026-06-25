// src/types/order.type.ts

import type { ProductFE } from "./product.type";

// ===== CART (client-side, tương lai gọi API bảng carts + items) =====

// Item trong giỏ hàng phía FE
export interface CartItemFE {
	itemPk?: number; // items.pk — needed for DELETE /carts/{cartId}/items/{itemPk}
	product: ProductFE; // Sản phẩm (map từ bảng products)
	quantity: number; // Số lượng (map field 'quantity' trong bảng items)
}

// ===== ORDER REQUEST (gửi lên BE để tạo đơn - bảng orders + orders_details) =====

// Chi tiết 1 sản phẩm trong đơn hàng gửi lên
export interface OrderDetailRequestDTO {
	productPk: number; // Map vào 'product_pk' trong bảng orders_details
	quantity: number; // Map vào 'quantity'
}

export interface OrderRequestDTO {
	fullname: string; // Map vào 'fullname' trong bảng orders
	phoneNumber: string; // Trả lại camelCase
	address: string; // Map vào 'address'
	cartId: number; // Trả lại camelCase
	paymentMethod: string; // Thêm trường paymentMethod cho dual-payment (COD, SEPAY)
}

// ===== ORDER RESPONSE (BE trả về) =====

// 1. Chi tiết đơn hàng - Dữ liệu thô BE trả về (bảng orders_details)
export interface OrderDetailResponseDTO {
	productNameVn: string; // Map từ 'product_name_vn'
	productNameEng: string; // Map từ 'product_name_eng'
	productPrice: number; // Map từ 'product_price' DECIMAL(18,2)
	quantity: number; // Map từ 'quantity'
	subtotal: number; // Map từ 'subtotal' DECIMAL(18,2)
}

export interface OrderResponseDTO {
	pk: number; // Map từ 'pk' BIGINT
	id: string; // Map từ 'id' VARCHAR(50) - Mã đơn VD: SF-12345
	businessId?: string; // Thêm businessId theo yêu cầu mới
	fullname: string; // Map từ 'fullname'
	phoneNumber: string; // Map từ 'phone_number'
	address: string; // Map từ 'address'
	total: number; // Map từ 'total' DECIMAL(18,2)
	status: string; // Map từ 'status' - DEFAULT 'PENDING'
	createdDate: string; // Map từ 'created_date' DATETIME2
	expiredDate: string; // Map từ 'expired_date' DATETIME2
	expired: boolean; // Map từ 'expired' BIT
	delIf: boolean; // Map từ 'del_if' BIT
	items: OrderDetailResponseDTO[];
	paymentMethod?: string;
}

// 3. Chi tiết đơn hàng - Dữ liệu sạch cho FE
export interface OrderDetailFE {
	productNameVn: string;
	productNameEng: string;
	productPrice: number;
	quantity: number;
	subtotal: number;
}

// 4. Đơn hàng - Dữ liệu sạch cho FE
export interface OrderFE {
	pk: number;
	id: string;
	businessId: string;
	fullname: string;
	phoneNumber: string;
	address: string;
	total: number;
	status: string;
	createdDate: string;
	isExpired: boolean;
	isActive: boolean;
	items: OrderDetailFE[];
	paymentMethod: string;
}

// 5. Hàm Mapper
// biome-ignore lint/suspicious/noExplicitAny: skip
export const mapOrderDetailResponseToFE = (dto: any): OrderDetailFE => {
	// Hỗ trợ cả 2 trường hợp: BE trả về phẳng (dto.productNameVn) hoặc lồng trong object product (dto.product.productNameVn)
	const product = dto.product || {};

	return {
		productNameVn:
			dto.productNameVn ||
			dto.product_name_vn ||
			product.nameVn ||
			product.name_vn ||
			product.productNameVn ||
			product.product_name_vn ||
			"Hoa Tuyển Chọn",
		productNameEng:
			dto.productNameEng ||
			dto.product_name_eng ||
			product.nameEng ||
			product.name_eng ||
			product.productNameEng ||
			product.product_name_eng ||
			"Premium Flower",
		productPrice:
			dto.productPrice ||
			dto.product_price ||
			product.price ||
			product.product_price ||
			0,
		quantity: dto.quantity || 1,
		subtotal:
			dto.subtotal ||
			(dto.quantity || 1) * (dto.productPrice || product.price || 0) ||
			0,
	};
};

// biome-ignore lint/suspicious/noExplicitAny: skip
export const mapOrderResponseToFE = (dto: any): OrderFE => {
	const rawItems =
		dto.items ||
		dto.details ||
		dto.orderDetails ||
		dto.order_details ||
		dto.orderItems ||
		dto.order_items ||
		[];

	return {
		pk: dto.pk || dto.id,
		id: dto.id || String(dto.pk),
		businessId: dto.businessId || dto.id || String(dto.pk),
		fullname: dto.fullname || dto.fullName || dto.full_name || "Khách hàng",
		phoneNumber: dto.phoneNumber || dto.phone_number || "",
		address: dto.address || "",
		total: dto.total || 0,
		status: dto.status || "PENDING",
		createdDate:
			dto.createdDate || dto.created_date || new Date().toISOString(),
		isExpired: !!dto.expired,
		isActive: !dto.delIf && !dto.del_if,
		items: rawItems.map(mapOrderDetailResponseToFE),
		paymentMethod: dto.paymentMethod || dto.payment_method || "COD",
	};
};
