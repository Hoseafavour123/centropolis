import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
            <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
        </div>
    );
}
