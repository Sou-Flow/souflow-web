import type { Metadata } from "next";

export const DEFAULT_OG_IMAGE = {
	url: "https://souflow.shop/images/og-image.jpg",
	width: 1200,
	height: 630,
	type: "image/jpeg",
	alt: "SouFlow - Hoa tươi thiết kế cao cấp",
};

export function constructMetadata({
	title,
	description,
	path = "",
	image = DEFAULT_OG_IMAGE.url,
	noIndex = false,
}: {
	title: string;
	description: string;
	path?: string;
	image?: string;
	noIndex?: boolean;
}): Metadata {
	const canonicalUrl = `https://souflow.shop${path}`;
	const isDefaultImage = image === DEFAULT_OG_IMAGE.url;

	return {
		title,
		description,
		alternates: {
			canonical: canonicalUrl,
		},
		openGraph: {
			title: `${title} | SouFlow`,
			description,
			url: canonicalUrl,
			siteName: "SouFlow",
			locale: "vi_VN",
			type: "website",
			images: [
				isDefaultImage
					? DEFAULT_OG_IMAGE
					: {
							url: image,
							width: 1200,
							height: 630,
							alt: title,
						},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: `${title} | SouFlow`,
			description,
			images: [image],
		},
		robots: noIndex
			? {
					index: false,
					follow: false,
				}
			: {
					index: true,
					follow: true,
				},
	};
}
