"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4 bg-sf-bg">
					<h2 className="text-2xl font-bold text-red-500">
						Đã xảy ra lỗi hệ thống!
					</h2>
					<p className="text-sf-fg-muted max-w-md">
						Rất tiếc, đã xảy ra lỗi trong quá trình tải giao diện. Vui lòng tải
						lại trang hoặc quay về trang chủ.
					</p>
					<button
						type="button"
						onClick={() => {
							this.setState({ hasError: false });
							window.location.href = "/";
						}}
						className="px-6 py-2 bg-sf-accent text-white rounded-full font-bold"
					>
						Về Trang Chủ
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}
