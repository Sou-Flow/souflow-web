export interface ApiResponse<T> {
	timestamp: string;
	status: number;
	message: string;
	errorCode: string;
	data: T; // <-- Chữ T (Type) này sẽ được thay thế linh hoạt
}

export interface PageResponse<T> {
	content: T[];
	pageNumber: number;
	pageSize: number;
	totalElements: number;
	totalPages: number;
	last: boolean;
}
