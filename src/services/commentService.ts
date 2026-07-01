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

			const rawList =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;
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
		productPk: number,
		content: string,
	): Promise<CommentFE | null> => {
		try {
			const rawResponse: ApiResponse<CommentResponseDTO> =
				await axiosClient.post(`/user/comment`, {
					productPk,
					content,
				});

			const actualData =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;
			if (
				!actualData &&
				!(rawResponse as unknown as Record<string, unknown>).pk
			)
				return null;
			const data = actualData;
			return mapCommentResponseToFE(data as CommentResponseDTO);
		} catch (error) {
			console.error("Lỗi khi thêm bình luận:", error);
			throw error;
		}
	},

	addReply: async (commentPk: number, content: string): Promise<unknown> => {
		try {
			const rawResponse = await axiosClient.post(`/user/reply`, {
				commentPk,
				content,
			});
			const actualData =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;
			return actualData;
		} catch (error) {
			console.error("Lỗi khi trả lời bình luận:", error);
			throw error;
		}
	},
};
