import { SignUp } from "@clerk/clerk-react";
import AuthLayout from "./AuthLayout";
import { clerkAppearance } from "../lib/clerkAppearance";

export default function SignUpPage() {
  return (
    <AuthLayout title="Start your path" subtitle="Tell us what you know, and AI will help shape what comes next.">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
}
