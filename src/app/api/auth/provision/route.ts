import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { provisionUserWallet } from "@/lib/payments/wallet";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { xLayerPublicClient, getXLayerWalletClient } from "@/lib/xlayer/client";
import { ADDRESSES } from "@/lib/xlayer/addresses";
import { FAN_PASSPORT_ABI } from "@/lib/xlayer/abis";
import { getTeamByCode } from "@/lib/data/wc2026-teams";

/**
 * POST /api/auth/provision
 *
 * Called after Google sign-in completes (from onboarding page client-side).
 * Idempotent — safe to call multiple times.
 *
 * 1. Verify session
 * 2. Provision Circle wallet (idempotent via Circle SDK)
 * 3. Mint FanPassport NFT on X Layer if not already minted
 * 4. Update Supabase profile with walletId + passportTokenId
 * 5. Return { walletId, walletAddress, passportTokenId }
 */
export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth check ────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({})) as {
      countryCode?: string;
      walletAddress?: string; // on-chain wallet address (from RainbowKit if connected)
    };

    const countryCode = body.countryCode ?? "US";
    const team = getTeamByCode(countryCode);
    const confederation = team?.conf ?? "CONCACAF";

    // ── 2. Circle wallet provisioning ────────────────────────────────────────
    const supabase = createSupabaseServerClient();

    // Check if profile already has a wallet
    let circleWalletId: string | null = session.user.circleWalletId ?? null;
    let circleWalletAddress: string | null = session.user.walletAddress ?? null;

    if (!circleWalletId) {
      const wallet = await provisionUserWallet(userId);
      if (wallet) {
        circleWalletId = wallet.walletId;
        circleWalletAddress = wallet.walletAddress;
        // Persist to DB
        if (supabase) {
          await supabase
            .from("profiles")
            .update({
              circle_wallet_id: circleWalletId,
              wallet_address: circleWalletAddress,
              country_code: countryCode,
              confederation,
            })
            .eq("id", userId);
        }
      }
    }

    // ── 3. FanPassport NFT minting on X Layer ─────────────────────────────────
    let passportTokenId: number | null = null;

    // The on-chain wallet address — prefer the user's connected wallet,
    // fall back to their Circle wallet address for the NFT recipient
    const onChainAddress = (body.walletAddress ?? circleWalletAddress) as `0x${string}` | null;

    if (onChainAddress && ADDRESSES.FAN_PASSPORT) {
      try {
        // Check if passport already exists on-chain
        const alreadyMinted = await xLayerPublicClient.readContract({
          address: ADDRESSES.FAN_PASSPORT,
          abi: FAN_PASSPORT_ABI,
          functionName: "hasPassport",
          args: [onChainAddress],
        });

        if (!alreadyMinted) {
          // Mint via platform deployer wallet
          const walletClient = getXLayerWalletClient();
          const hash = await walletClient.writeContract({
            address: ADDRESSES.FAN_PASSPORT,
            abi: FAN_PASSPORT_ABI,
            functionName: "mint",
            args: [onChainAddress, countryCode, confederation],
          });

          // Wait for confirmation
          const receipt = await xLayerPublicClient.waitForTransactionReceipt({ hash });

          // Read tokenId from contract
          const tokenIdRaw = await xLayerPublicClient.readContract({
            address: ADDRESSES.FAN_PASSPORT,
            abi: FAN_PASSPORT_ABI,
            functionName: "addressToTokenId",
            args: [onChainAddress],
          });
          passportTokenId = Number(tokenIdRaw);

          // Persist tokenId to Supabase
          if (supabase && passportTokenId) {
            await supabase
              .from("profiles")
              .update({ passport_token_id: passportTokenId })
              .eq("id", userId);
          }

          console.log("[provision] FanPassport minted:", {
            userId,
            onChainAddress,
            passportTokenId,
            hash,
          });
        } else {
          // Already minted — read existing tokenId
          const tokenIdRaw = await xLayerPublicClient.readContract({
            address: ADDRESSES.FAN_PASSPORT,
            abi: FAN_PASSPORT_ABI,
            functionName: "addressToTokenId",
            args: [onChainAddress],
          });
          passportTokenId = Number(tokenIdRaw);
        }
      } catch (passportErr) {
        // Non-fatal — passport minting failure does not block sign-in
        console.error("[provision] FanPassport mint failed (non-fatal):", passportErr);
      }
    }

    return NextResponse.json({
      ok: true,
      walletId: circleWalletId,
      walletAddress: circleWalletAddress,
      passportTokenId,
      countryCode,
      confederation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Provision failed";
    console.error("[/api/auth/provision]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
