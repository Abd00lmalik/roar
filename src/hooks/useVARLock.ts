"use client";

import { useEffect, useState, useRef } from "react";
import { xLayerPublicClient } from "@/lib/xlayer/client";
import { ADDRESSES, contractsConfigured } from "@/lib/xlayer/addresses";
import { BILLING_CONTROLLER_ABI } from "@/lib/xlayer/abis";

/**
 * useVARLock — listens to BillingLocked/BillingUnlocked events from the
 * BillingController contract on X Layer in real time.
 *
 * The billing loop in WatchClient checks this before every Circle charge.
 * When locked, no payments are processed — fans love not paying during VAR.
 *
 * @param matchId  String slug for the match, e.g. "bra-vs-arg-group-c"
 *                 Must match the encoding used by the backend (Buffer.from + padEnd)
 */
export function useVARLock(matchId: string): boolean {
  const [locked, setLocked] = useState(false);
  const unwatchRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!contractsConfigured() || !ADDRESSES.BILLING_CONTROLLER) {
      // Contracts not configured — default to unlocked
      setLocked(false);
      return;
    }

    // Encode matchId the same way the backend does
    const matchIdBytes32 = `0x${Buffer.from(matchId)
      .toString("hex")
      .padEnd(64, "0")}` as `0x${string}`;

    // Read initial state
    xLayerPublicClient
      .readContract({
        address: ADDRESSES.BILLING_CONTROLLER,
        abi: BILLING_CONTROLLER_ABI,
        functionName: "isLocked",
        args: [matchIdBytes32],
      })
      .then((isLocked) => setLocked(Boolean(isLocked)))
      .catch((err) => console.error("[useVARLock] initial read failed:", err));

    // Subscribe to BillingLocked events
    const unwatchLocked = xLayerPublicClient.watchContractEvent({
      address: ADDRESSES.BILLING_CONTROLLER,
      abi: BILLING_CONTROLLER_ABI,
      eventName: "BillingLocked",
      onLogs: (logs) => {
        for (const log of logs) {
          if ((log.args as { matchId?: string })?.matchId === matchIdBytes32) {
            console.log("[useVARLock] 🔒 Billing locked — VAR review started");
            setLocked(true);
          }
        }
      },
      onError: (err) => console.error("[useVARLock] BillingLocked watch error:", err),
    });

    // Subscribe to BillingUnlocked events
    const unwatchUnlocked = xLayerPublicClient.watchContractEvent({
      address: ADDRESSES.BILLING_CONTROLLER,
      abi: BILLING_CONTROLLER_ABI,
      eventName: "BillingUnlocked",
      onLogs: (logs) => {
        for (const log of logs) {
          if ((log.args as { matchId?: string })?.matchId === matchIdBytes32) {
            console.log("[useVARLock] 🔓 Billing unlocked — play resumed");
            setLocked(false);
          }
        }
      },
      onError: (err) => console.error("[useVARLock] BillingUnlocked watch error:", err),
    });

    unwatchRef.current = () => {
      unwatchLocked();
      unwatchUnlocked();
    };

    return () => {
      unwatchRef.current?.();
    };
  }, [matchId]);

  return locked;
}
