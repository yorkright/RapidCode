"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function MainLayout({ children }) {
  const { userId, isLoaded } = useAuth();
  const [synced, setSynced] = useState(false);

  // 🔄 Auto-sync when user enters protected route
  useEffect(() => {
    if (!isLoaded || !userId || synced) return;

    const syncUser = async () => {
      try {
        console.log("🔄 Syncing user on /Main entry...");

        const response = await fetch("/api/users/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          console.log("✅ User synced successfully:", data.user);
        } else {
          console.error("⚠️ Sync warning:", data.error);
        }
      } catch (error) {
        console.error("⚠️ Sync error:", error);
      } finally {
        setSynced(true);
      }
    };

    syncUser();
  }, [isLoaded, userId, synced]);

  return <>{children}</>;
}