import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { provisionUserWallet } from "@/lib/payments/wallet";
import { xLayerPublicClient, getXLayerWalletClient } from "@/lib/xlayer/client";
import { ADDRESSES } from "@/lib/xlayer/addresses";
import { FAN_PASSPORT_ABI } from "@/lib/xlayer/abis";
import { getTeamByCode } from "@/lib/data/wc2026-teams";

/**
 * POST /api/auth/provision
 *
 * Called after sign-in completes or a Web3 wallet is connected.
 * Idempotent — safe to call multiple times.
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role — bypasses RLS
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // 1. Get current user from NextAuth session
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    // Get current user from Supabase Auth if NextAuth is not present
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    // During the free-watch window, user may not exist yet — that is OK
    // Only return 401 if we need a user and genuinely don't have one
    if (!userId) {
      // Allow anonymous sessions — provision will be called again after auth
      return NextResponse.json({ anonymous: true }, { status: 200 });
    }

    const body = await req.json().catch(() => ({})) as {
      countryCode?: string;
      walletAddress?: string; // on-chain wallet address
    };

    const countryCode = body.countryCode ?? "US";
    const team = getTeamByCode(countryCode);
    const confederation = team?.conf ?? "CONCACAF";

    // 2. Fetch profile to see if they already have a circle wallet
    const { data: profile } = await supabase
      .from("profiles")
      .select("circle_wallet_id, wallet_address, country_code, confederation")
      .eq("id", userId)
      .maybeSingle();

    let circleWalletId = profile?.circle_wallet_id;
    let circleWalletAddress = profile?.wallet_address;
    let finalCountryCode = profile?.country_code ?? countryCode;
    let finalConfederation = profile?.confederation ?? confederation;

    if (!circleWalletId) {
      const wallet = await provisionUserWallet(userId);
      if (wallet) {
        circleWalletId = wallet.walletId;
        circleWalletAddress = wallet.walletAddress;
        
        await supabase
          .from("profiles")
          .update({
            circle_wallet_id: circleWalletId,
            wallet_address: circleWalletAddress,
            country_code: finalCountryCode,
            confederation: finalConfederation,
          })
          .eq("id", userId);
      }
    }

    // 3. Update with Web3 walletAddress if provided
    if (body.walletAddress) {
      circleWalletAddress = body.walletAddress;
      await supabase
        .from("profiles")
        .update({
          wallet_address: body.walletAddress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }

    // 4. Mint FanPassport NFT on X Layer L2
    let passportTokenId: number | null = null;
    const onChainAddress = circleWalletAddress as `0x${string}` | null;

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
          const walletClient = getXLayerWalletClient();
          const hash = await walletClient.writeContract({
            address: ADDRESSES.FAN_PASSPORT,
            abi: FAN_PASSPORT_ABI,
            functionName: "mint",
            args: [onChainAddress, finalCountryCode, finalConfederation],
          });

          // Wait for confirmation
          await xLayerPublicClient.waitForTransactionReceipt({ hash });

          // Read tokenId
          const tokenIdRaw = await xLayerPublicClient.readContract({
            address: ADDRESSES.FAN_PASSPORT,
            abi: FAN_PASSPORT_ABI,
            functionName: "addressToTokenId",
            args: [onChainAddress],
          });
          passportTokenId = Number(tokenIdRaw);

          // Update profile
          await supabase
            .from("profiles")
            .update({ passport_token_id: passportTokenId })
            .eq("id", userId);

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
        console.error("[provision] FanPassport mint failed (non-fatal):", passportErr);
      }
    }

    return NextResponse.json({
      success: true,
      walletId: circleWalletId,
      walletAddress: circleWalletAddress,
      passportTokenId,
      countryCode: finalCountryCode,
      confederation: finalConfederation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Provision failed";
    console.error("[/api/auth/provision]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
