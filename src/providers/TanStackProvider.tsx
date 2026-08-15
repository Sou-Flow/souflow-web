"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function TanStackProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	// Khởi tạo QueryClient một lần duy nhất bằng useState để không bị mất data khi re-render
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 1 phút giữ data không gọi lại API thừa
						gcTime: 5 * 60 * 1000, // 5 phút lưu trong bộ nhớ
						refetchOnWindowFocus: false, // Tắt tự gọi lại khi đổi tab
						retry: 1,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
