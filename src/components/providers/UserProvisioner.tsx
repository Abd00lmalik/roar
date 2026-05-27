"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

export function UserProvisioner() {
  const { data: session, update } = useSession();
  const { address: connectedAddress } = useAccount();
  const provisioningRef = useRef(false);

  useEffect(() => {
    // Only run if user is signed in
    if (!session?.user?.id) return;

    // Check if session already has a wallet address
    const hasWallet = session.user.walletAddress;

    // If they don't have a wallet, trigger provisioning API
    if (!hasWallet && !provisioningRef.current) {
      provisioningRef.current = true;

      // Get supporter nation from cookie or local storage, fallback to US
      let countryCode = "US";
      try {
        const saved = localStorage.getItem("roar_selected_team");
        if (saved) {
          const team = JSON.parse(saved);
          if (team?.code) countryCode = team.code;
        } else {
          const cookieCountry = document.cookie
            .split("; ")
            .find((row) => row.startsWith("supporter_nation="))
            ?.split("=")[1];
          if (cookieCountry) countryCode = cookieCountry;
        }
      } catch (err) {
        console.warn("[UserProvisioner] Failed to read selected team:", err);
      }

      console.log("[UserProvisioner] Automatically provisioning wallet on first sign-in...", {
        userId: session.user.id,
        countryCode,
      });

      fetch("/api/auth/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode,
          walletAddress: connectedAddress || undefined,
        }),
      })
        .then(async (res) => {
          const isJson = res.headers.get("content-type")?.includes("application/json");
          const data = isJson ? await res.json() : null;
          if (!res.ok) {
            throw new Error(data?.error ?? `HTTP ${res.status}`);
          }
          return data;
        })
        .then((data) => {
          if (data && data.success) {
            console.log("[UserProvisioner] Automatic wallet provisioned successfully:", data);
            // Refresh NextAuth session to load the wallet address into the client cookie session
            update();
          } else {
            console.error("[UserProvisioner] Automatic provisioning failed:", data?.error ?? "Unknown error");
            if (data?.databaseCheck) {
              console.warn(
                "==================================================\n" +
                "DATABASE CONFIGURATION WARNING (RoarTube)\n" +
                `Error: ${data.error}\n` +
                `Detail: ${data.databaseCheck.errorDetail}\n` +
                `Hint: ${data.databaseCheck.hint}\n` +
                "Please check the supabase migrations directory or execute migration 005 manually.\n" +
                "=================================================="
              );
            }
          }
        })
        .catch((err) => {
          console.error("[UserProvisioner] Automatic provisioning request error:", err);
        })
        .finally(() => {
          provisioningRef.current = false;
        });
    }
  }, [session, connectedAddress, update]);

  return null;
}
