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
						refetchOnWindowFocus: false, // Tắt cái vụ user qua tab khác quay lại nó tự gọi API (đỡ tốn băng thông)
						retry: 1, // Nếu API lỗi, thử gọi lại 1 lần thôi
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
