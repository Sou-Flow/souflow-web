// src/services/commentService.ts

import type { ApiResponse } from "@/types/api.type";
import {
	type CommentFE,
	type CommentResponseDTO,
	mapCommentResponseToFE,
} from "@/types/comment.type";
import axiosClient from "./axiosClient";

export const commentService = {
	getCommentsByProduct: async (productCode: string): Promise<CommentFE[]> => {
		try {
			const rawResponse: ApiResponse<CommentResponseDTO[]> =
				await axiosClient.get(`/products/by-code/${productCode}/comments`);

			const rawList = rawResponse.data;
			if (!Array.isArray(rawList)) {
				return [];
			}

			return rawList.map((item) => mapCommentResponseToFE(item));
		} catch (error) {
			console.warn(
				`⚠️ API '/products/by-code/${productCode}/comments' lỗi.`,
				error,
			);
			return [];
		}
	},

	addComment: async (
		productCode: string,
		content: string,
	): Promise<CommentFE | null> => {
		try {
			const rawResponse: ApiResponse<CommentResponseDTO> =
				await axiosClient.post(`/products/by-code/${productCode}/comments`, {
					content,
				});

			if (!rawResponse.data) return null;
			return mapCommentResponseToFE(rawResponse.data);
		} catch (error) {
			console.error("Lỗi khi thêm bình luận:", error);
			throw error;
		}
	},

	addReply: async (commentId: number, content: string): Promise<void> => {
		try {
			await axiosClient.post(`/comments/${commentId}/replies`, { content });
		} catch (error) {
			console.error("Lỗi khi trả lời bình luận:", error);
			throw error;
		}
	},
};
