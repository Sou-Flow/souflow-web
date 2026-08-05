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
	phone: string; // Match BE field 'phone'
	address: string; // Map vào 'address'
	orderDetailRequests: OrderDetailRequestDTO[]; // Gửi danh sách sản phẩm thay vì cartId
	paymentMethod: string; // Thêm trường paymentMethod cho dual-payment (COD, SEPAY)
	shippingFee?: number; // Truyền phí ship lên Backend
	discountCode?: string | null;
	discountAmount?: number;
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
	discountCode?: string;
	discountAmount?: string | number;
}

// 3. Chi tiết đơn hàng - Dữ liệu sạch cho FE
export interface OrderDetailFE {
	productNameVn: string;
	productNameEng: string;
	productPrice: number;
	quantity: number;
	subtotal: number;
	productImage?: string;
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
	shippingFee: number;
	status: string;
	createdDate: string;
	isExpired: boolean;
	isActive: boolean;
	items: OrderDetailFE[];
	paymentMethod: string;
	discountCode?: string;
	discountAmount: number;
}

// 5. Hàm Mapper
// biome-ignore lint/suspicious/noExplicitAny: skip
export const mapOrderDetailResponseToFE = (dto: any): OrderDetailFE => {
	// Hỗ trợ cả 2 trường hợp: BE trả về phẳng (dto.productNameVn) hoặc lồng trong object product (dto.product.productNameVn)
	const product = dto.product || dto.flower || dto.item || {};

	// Gom tất cả các key có thể chứa tên
	const mappedNameVn =
		dto.productNameVn ||
		dto.product_name_vn ||
		dto.productName ||
		dto.product_name ||
		dto.nameVn ||
		dto.name_vn ||
		dto.name ||
		dto.flowerName ||
		dto.title ||
		product.nameVn ||
		product.name_vn ||
		product.productNameVn ||
		product.product_name_vn ||
		product.productName ||
		product.name ||
		product.title ||
		"Hoa Tuyển Chọn";

	const mappedNameEng =
		dto.productNameEng ||
		dto.product_name_eng ||
		dto.nameEng ||
		dto.name_eng ||
		product.nameEng ||
		product.name_eng ||
		product.productNameEng ||
		product.product_name_eng ||
		"Premium Flower";

	// Gom tất cả các key có thể chứa giá
	const mappedPrice = Number(
		dto.productPrice ||
			dto.product_price ||
			dto.price ||
			dto.unitPrice ||
			dto.unit_price ||
			dto.amount ||
			product.price ||
			product.product_price ||
			product.productPrice ||
			product.unitPrice ||
			0,
	);

	const mappedQuantity = Number(dto.quantity || dto.qty || dto.amount || 1);

	const mappedSubtotal = Number(
		dto.subtotal ||
			dto.sub_total ||
			dto.totalPrice ||
			dto.total_price ||
			mappedQuantity * mappedPrice ||
			0,
	);

	// Gom tất cả các key có thể chứa ảnh
	const rawImage =
		dto.productImage ||
		dto.product_image ||
		dto.imageUrl ||
		dto.imageURL ||
		dto.image_url ||
		dto.image ||
		dto.picture ||
		dto.thumbnail ||
		dto.url ||
		product?.imageUrl ||
		product?.imageURL ||
		product?.image_url ||
		product?.image ||
		product?.productImage ||
		product?.product_image ||
		product?.picture ||
		product?.thumbnail ||
		product?.url ||
		product?.productImageResponses?.[0]?.url ||
		product?.productImageResponses?.[0]?.name ||
		product?.images?.[0] ||
		"";

	// Lọc bỏ chuỗi "null" do BE vô tình parse sai
	const isValidImage =
		rawImage && rawImage !== "null" && rawImage !== "undefined";
	const mappedImage = isValidImage
		? String(rawImage).replace(/([^:]\/)\/+/g, "$1")
		: "";

	return {
		productNameVn: mappedNameVn,
		productNameEng: mappedNameEng,
		productPrice: mappedPrice,
		quantity: mappedQuantity,
		subtotal: mappedSubtotal,
		productImage: mappedImage,
	};
};

// biome-ignore lint/suspicious/noExplicitAny: skip
export const mapOrderResponseToFE = (dto: any): OrderFE => {
	const rawItems =
		dto.orderDetailResponses ||
		dto.order_detail_responses ||
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
		phoneNumber: dto.phone || dto.phoneNumber || dto.phone_number || "",
		address: dto.address || "",
		total: dto.total || 0,
		shippingFee: Number(
			dto.shippingFee || dto.shipping_fee || dto.shipping || dto.fee || 0,
		),
		status: dto.status || "PENDING",
		createdDate:
			dto.createdDate || dto.created_date || new Date().toISOString(),
		isExpired: Boolean(dto.expired),
		isActive: !dto.delIf && !dto.del_if,
		items: Array.isArray(rawItems)
			? rawItems.map(mapOrderDetailResponseToFE)
			: [],
		paymentMethod:
			dto.paymentmethod ||
			dto.paymentMethod ||
			dto.payment_method ||
			dto.paymentType ||
			dto.payment_type ||
			dto.payment ||
			"COD",
		discountCode: dto.discountCode,
		discountAmount: Number(dto.discountAmount) || 0,
	};
};
