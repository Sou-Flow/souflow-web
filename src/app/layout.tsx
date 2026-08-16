import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { BoutiqueProviders } from "@/providers/SoulflowProviders";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SouFlowShell } from "@/components/SouFlowShell";
import { AuthProvider } from "@/providers/AuthProviders";
import GoogleProvider from "@/providers/GoogleProvider";
import TanStackProvider from "@/providers/TanStackProvider";
import { WebSocketProvider } from "@/providers/WebSocketProvider";

const inter = Inter({
	variable: "--font-geist-sans",
	subsets: ["latin", "vietnamese"],
});

const playfair = Playfair_Display({
	variable: "--font-serif",
	subsets: ["latin", "vietnamese"],
});

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#fcfaf7" },
		{ media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
	],
};

export const metadata: Metadata = {
	metadataBase: new URL("https://souflow.shop"),
	title: {
		default: "SouFlow | Hoa tươi thiết kế cao cấp",
		template: "%s | SouFlow",
	},
	description:
		"SouFlow - Nơi kết nối tâm hồn và thiên nhiên. Khám phá bộ sưu tập thiết kế hoa tươi nghệ thuật độc đáo, hoa cưới, hoa sinh nhật, hoa chúc mừng.",
	keywords: [
		"hoa tươi",
		"hoa tươi thiết kế",
		"shop hoa tươi",
		"tiệm hoa tươi",
		"đặt hoa tươi online",
		"hoa sinh nhật",
		"hoa khai trương",
		"hoa cưới",
		"bó hoa tươi",
		"lẵng hoa",
		"SouFlow",
		"souflow.shop",
	],
	authors: [{ name: "SouFlow Florist", url: "https://souflow.shop" }],
	creator: "SouFlow",
	publisher: "SouFlow",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	alternates: {
		canonical: "https://souflow.shop",
	},
	robots: {
		index: true,
		follow: true,
		nocache: false,
		googleBot: {
			index: true,
			follow: true,
			noimageindex: false,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	openGraph: {
		type: "website",
		locale: "vi_VN",
		url: "https://souflow.shop",
		siteName: "SouFlow",
		title: "SouFlow | Hoa tươi thiết kế cao cấp",
		description:
			"SouFlow - Nơi kết nối tâm hồn và thiên nhiên. Khám phá bộ sưu tập thiết kế hoa tươi nghệ thuật độc đáo.",
		images: [
			{
				url: "https://souflow.shop/images/about-us-main1.avif",
				width: 1200,
				height: 630,
				alt: "SouFlow - Hoa tươi thiết kế cao cấp",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "SouFlow | Hoa tươi thiết kế cao cấp",
		description:
			"SouFlow - Nơi kết nối tâm hồn và thiên nhiên. Khám phá bộ sưu tập thiết kế hoa tươi nghệ thuật độc đáo.",
		images: ["https://souflow.shop/images/about-us-main1.avif"],
	},
};

const storeJsonLd = {
	"@context": "https://schema.org",
	"@type": "Florist",
	name: "SouFlow",
	image: "https://souflow.shop/images/about-us-main1.avif",
	url: "https://souflow.shop",
	telephone: "+84901234567",
	priceRange: "₫₫",
	address: {
		"@type": "PostalAddress",
		streetAddress: "Tòa nhà QTSC 9, Công viên phần mềm Quang Trung",
		addressLocality: "Quận 12",
		addressRegion: "Hồ Chí Minh",
		addressCountry: "VN",
	},
	geo: {
		"@type": "GeoCoordinates",
		latitude: 10.8538,
		longitude: 106.6262,
	},
	openingHoursSpecification: {
		"@type": "OpeningHoursSpecification",
		dayOfWeek: [
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
			"Sunday",
		],
		opens: "08:00",
		closes: "21:00",
	},
	sameAs: [
		"https://facebook.com/souflow.shop",
		"https://instagram.com/souflow.shop",
	],
	potentialAction: {
		"@type": "SearchAction",
		target: "https://souflow.shop/catalog?search={search_term_string}",
		"query-input": "required name=search_term_string",
	},
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
			<head>
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Google SEO JSON-LD schema
					dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
				/>
			</head>
			<body className="min-h-full flex flex-col bg-sf-bg text-sf-fg transition-colors duration-300">
				<GoogleProvider>
					<TanStackProvider>
						<AuthProvider>
							<ThemeProvider>
								<WebSocketProvider>
									<BoutiqueProviders>
										<ErrorBoundary>
											<SouFlowShell>{children}</SouFlowShell>
										</ErrorBoundary>
									</BoutiqueProviders>
								</WebSocketProvider>
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
				</GoogleProvider>
			</body>
		</html>
	);
}
