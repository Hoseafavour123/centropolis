import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
            <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
        </div>
    );
}
