// src/types/comment.type.ts

// ===== COMMENTS (bảng comments) =====

// 1. Dữ liệu thô BE trả về
export interface CommentResponseDTO {
	id: number; // Map từ 'pk'
	content: string;
	createdDate: string;
	productId: number; // Map từ 'product_pk'
	accountId: number; // Map từ 'account_pk'
	accountFullName: string; // BE có thể join bảng accounts trả về tên
	delIf: boolean;
}

// 2. Dữ liệu sạch cho FE xài
export interface CommentFE {
	id: number;
	content: string;
	createdDate: string;
	productId: number;
	accountId: number;
	authorName: string;
	isActive: boolean;
	replies: ReplyFE[];
}

// 3. Hàm Mapper
export const mapCommentResponseToFE = (
	dto: CommentResponseDTO,
	replies: ReplyFE[] = [],
): CommentFE => {
	return {
		id: dto.id,
		content: dto.content,
		createdDate: dto.createdDate,
		productId: dto.productId,
		accountId: dto.accountId,
		authorName: dto.accountFullName || "Người dùng",
		isActive: !dto.delIf,
		replies,
	};
};

// ===== REPLIES (bảng replies) =====

// 1. Dữ liệu thô BE trả về
export interface ReplyResponseDTO {
	id: number; // Map từ 'pk'
	content: string;
	createdDate: string;
	commentId: number; // Map từ 'comment_pk'
	accountId: number; // Map từ 'account_pk'
	accountFullName: string;
	delIf: boolean;
}

// 2. Dữ liệu sạch cho FE xài
export interface ReplyFE {
	id: number;
	content: string;
	createdDate: string;
	commentId: number;
	accountId: number;
	authorName: string;
	isActive: boolean;
}

// 3. Hàm Mapper
export const mapReplyResponseToFE = (dto: ReplyResponseDTO): ReplyFE => {
	return {
		id: dto.id,
		content: dto.content,
		createdDate: dto.createdDate,
		commentId: dto.commentId,
		accountId: dto.accountId,
		authorName: dto.accountFullName || "Người dùng",
		isActive: !dto.delIf,
	};
};

// ===== REQUEST DTOs =====

export interface CommentRequestDTO {
	content: string;
	productPk: number;
	// accountPk sẽ được BE lấy từ token
}

export interface ReplyRequestDTO {
	content: string;
	commentPk: number;
	// accountPk sẽ được BE lấy từ token
}
