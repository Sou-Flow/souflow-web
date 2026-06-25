export interface ApiResponse<T> {
	timestamp: string;
	status: number;
	message: string;
	errorCode: string;
	data: T; // <-- Chữ T (Type) này sẽ được thay thế linh hoạt
}

export interface PaginatedResponse<T> {
	content: T[];
	pageNo: number;
	pageSize: number;
	totalElements: number;
	totalPages: number;
	last: boolean;
}
