import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";
import { constructMetadata } from "@/lib/souflow/seo";

export const metadata: Metadata = constructMetadata({
	title: "Thanh Toán Đơn Hàng",
	description: "Hoàn tất đặt hoa tươi tại SouFlow qua SePay QR hoặc giao hàng COD.",
	path: "/checkout",
	noIndex: true,
});

export default function CheckoutPage() {
	return <CheckoutForm />;
}
