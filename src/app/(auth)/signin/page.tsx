import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import SignInForm from "@/components/SignInForm";
import ThemeToggle from "@/components/ThemeToggle";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
    const session = await getServerSession(authOptions);
    if (session?.user?.id && !session.revoked) {
        redirect("/dashboard");
    }

    return (
        <div className="auth-shell">
            <div className="fixed right-4 top-4 z-20">
                <ThemeToggle />
            </div>
            <div className="grid gap-4">
                <SignInForm />
                <div className="text-sm muted text-center">
                    No account yet? <Link href="/register" className="underline underline-offset-4">Create one</Link>
                </div>
            </div>
        </div>
    );
}
