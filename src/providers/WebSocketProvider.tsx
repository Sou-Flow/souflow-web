"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { type ReactNode, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { getApiBaseUrl } from "@/services/axiosClient";
import { useAuthStore } from "@/store/auth-store";

// Bộ nhớ đệm tạm thời để chống loop / trùng lặp thông báo trong khoảng thời gian ngắn
const recentNotificationKeys = new Set<string>();

type WebSocketProviderProps = {
	children: ReactNode;
};

export function WebSocketProvider({ children }: WebSocketProviderProps) {
	const { user } = useAuthStore();
	const queryClient = useQueryClient();
	const clientRef = useRef<Client | null>(null);

	useEffect(() => {
		if (!user?.username) {
			if (clientRef.current?.active) {
				clientRef.current.deactivate();
				clientRef.current = null;
			}
			return;
		}

		const socketUrl = `${getApiBaseUrl()}/ws`;

		const client = new Client({
			webSocketFactory: () => new SockJS(socketUrl),
			reconnectDelay: 5000,
			heartbeatIncoming: 4000,
			heartbeatOutgoing: 4000,
			onConnect: () => {
				console.log("Global WebSocket connected for user:", user.username);

				client.subscribe(
					`/topic/user.notifications.${user.username}`,
					(message) => {
						try {
							const payload = JSON.parse(message.body);
							const msgText =
								payload.message || "Trạng thái đơn hàng vừa được cập nhật!";

							// Chống loop thông báo lặp lại
							const dedupKey = `${payload.type || ""}_${payload.referenceId || ""}_${payload.status || ""}_${msgText}`;
							if (recentNotificationKeys.has(dedupKey)) {
								return;
							}
							recentNotificationKeys.add(dedupKey);
							setTimeout(() => {
								recentNotificationKeys.delete(dedupKey);
							}, 5000);

							toast.success(msgText);
							queryClient.invalidateQueries({ queryKey: ["orderHistory"] });

							// Bắn event để các trang cục bộ (như AccountForm) có thể đồng bộ mà không cần mở kết nối WS riêng
							if (typeof window !== "undefined") {
								window.dispatchEvent(
									new CustomEvent("orderStatusUpdated", {
										detail: payload,
									}),
								);
							}
						} catch (err) {
							console.error("Lỗi khi xử lý thông báo WebSocket:", err);
						}
					},
				);
			},
			onStompError: (frame) => {
				console.warn(`WebSocket Stomp Error: ${frame.headers.message}`);
			},
		});

		client.activate();
		clientRef.current = client;

		return () => {
			if (client.active) {
				client.deactivate();
			}
			clientRef.current = null;
		};
	}, [user?.username, queryClient]);

	return <>{children}</>;
}
