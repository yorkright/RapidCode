"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const handleSignUpComplete = async () => {
    console.log("🎉 Sign-up completed! Syncing user...");

    try {
      // Wait for Clerk to set up the session
      await new Promise((res) => setTimeout(res, 1000));

      const response = await fetch("/api/users/sync", {
        method: "POST",
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        console.log("✅ Sync successful!");
      }
    } catch (error) {
      console.error("⚠️ Sync error:", error);
    }

    // Always redirect
    router.push("/Main");
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        afterSignUpUrl="/Main"
        fallbackRedirectUrl="/Main"
        signInUrl="/sign-in"
      />
    </div>
  );
}