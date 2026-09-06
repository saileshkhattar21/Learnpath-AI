import { SignIn } from "@clerk/clerk-react";
import AuthLayout from "./AuthLayout";
import { clerkAppearance } from "../lib/clerkAppearance";

export default function SignInPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your AI-guided learning path.">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
}
