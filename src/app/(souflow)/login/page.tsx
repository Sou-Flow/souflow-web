import { Suspense } from "react";
import { LoginScreen } from "@/components/LoginScreen";

export default function LoginPage() {
	return (
		<Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
			<LoginScreen />
		</Suspense>
	);
}
