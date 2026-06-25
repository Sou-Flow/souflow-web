"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

type SoulFlowShellProps = {
	children: ReactNode;
};

export function SoulFlowShell({ children }: SoulFlowShellProps) {
	const _pathname = usePathname();
	const [isCartOpen, setIsCartOpen] = useState(false);

	return (
		<div className="min-h-screen flex flex-col justify-between bg-sf-bg text-sf-fg transition-colors duration-300">
			<Navbar onOpenCart={() => setIsCartOpen(true)} />
			<CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

			<main className="grow">{children}</main>

			<Footer />
		</div>
	);
}
