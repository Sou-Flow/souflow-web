export const soulFlowRoutes = {
	home: "/",
	catalog: "/catalog",
	product: (code: string) => `/catalog/${code}`,
	//bespoke: "/bespoke",
	checkout: "/checkout",
	account: "/account",
	contact: "/contact",
	about: "/about",
	privacy: "/privacy",
	terms: "/terms",
	login: "/login",
	register: "/register",
	forgotPassword: "/forgot-password",
} as const;

export type SouFlowRouteKey = keyof typeof soulFlowRoutes;
