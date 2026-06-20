import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { BoutiqueProviders } from "@/providers/SoulflowProviders";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProviders";
import TanStackProvider from "@/providers/TanStackProvider";

const inter = Inter({
	variable: "--font-geist-sans",
	subsets: ["latin", "vietnamese"],
});

const playfair = Playfair_Display({
	variable: "--font-serif",
	subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
	title: "SoulFlow",
	description:
		"SoulFlow - Nơi kết nối tâm hồn và thiên nhiên. Khám phá bộ sưu tập thiết kế hoa độc đáo.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="vi"
			className={`${inter.variable} ${playfair.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<body className="min-h-full flex flex-col bg-sf-bg text-sf-fg transition-colors duration-300">
				<TanStackProvider>
					<AuthProvider>
						<ThemeProvider>
							<BoutiqueProviders>{children}</BoutiqueProviders>
							<Toaster
								position="top-right"
								toastOptions={{
									style: {
										background: "#2A2A2A",
										color: "#fff",
										borderRadius: "10px",
										border: "1px solid #4A4A4A",
									},
									success: {
										iconTheme: {
											primary: "#4ade80",
											secondary: "#fff",
										},
									},
								}}
							/>
						</ThemeProvider>
					</AuthProvider>
				</TanStackProvider>
			</body>
		</html>
	);
}
