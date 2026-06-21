"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

type ThemeProviderProps = {
	children: ReactNode;
};

/**
 * Class-based theme switching with persisted preference.
 * enableSystem=false avoids fighting explicit light/dark toggles.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="light"
			enableSystem={false}
			storageKey="soulflow-theme"
			themes={["light", "dark"]}
			disableTransitionOnChange={false}
		>
			{children}
		</NextThemesProvider>
	);
}
