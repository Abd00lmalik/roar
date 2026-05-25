import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SPLIT, COST_PER_SECOND_USDC } from "@/lib/payments/micropayments";

/**
 * POST /api/payments/charge
 *
 * Records a micropayment charge event (per-second streaming tick or batch).
 * The actual on-chain settlement happens via the existing voucher system
 * (useWatchSession → /api/vouchers/sink). This endpoint tracks the
 * accumulated session debt and the 85/10/5 split breakdown.
 *
 * Body:
 *   wallet_id          — user's Circle walletId
 *   creator_address    — creator wallet address (85%)
 *   fan_pool_address   — X Layer fan pool (10%)
 *   treasury_address   — platform treasury (5%)
 *   amount_usdc        — total USDC for this tick
 *   seconds_covered    — optional, defaults to 1
 *   split              — computed split object (validated server-side)
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      wallet_id?: string;
      creator_address?: string;
      fan_pool_address?: string;
      treasury_address?: string;
      amount_usdc?: number;
      seconds_covered?: number;
    };

    const {
      wallet_id,
      creator_address,
      fan_pool_address,
      treasury_address,
      amount_usdc,
      seconds_covered = 1,
    } = body;

    if (!wallet_id || !creator_address) {
      return NextResponse.json({ error: "wallet_id and creator_address are required" }, { status: 400 });
    }

    // Validate amount (server-side rate enforcement)
    const expectedAmount = seconds_covered * COST_PER_SECOND_USDC;
    const tolerance = 0.0001;
    const reported = amount_usdc ?? expectedAmount;
    if (Math.abs(reported - expectedAmount) > tolerance) {
      return NextResponse.json({ error: "Amount mismatch — rate is 0.001 USDC/sec" }, { status: 400 });
    }

    // Compute authoritative split server-side (never trust client split)
    const creatorAmount = reported * SPLIT.CREATOR;
    const fanPoolAmount = reported * SPLIT.FAN_POOL;
    const treasuryAmount = reported * SPLIT.TREASURY;

    // Persist to Supabase streaming_charges table (best-effort)
    const supabase = createSupabaseServerClient();
    if (supabase) {
      await supabase.from("streaming_charges").insert({
        wallet_id,
        creator_address,
        fan_pool_address: fan_pool_address ?? process.env.FAN_REWARDS_ADDRESS,
        treasury_address: treasury_address ?? process.env.TREASURY_ADDRESS,
        amount_usdc: reported,
        seconds_covered,
        creator_amount: creatorAmount,
        fan_pool_amount: fanPoolAmount,
        treasury_amount: treasuryAmount,
        settled: false,
        created_at: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.warn("[/api/payments/charge] insert warning:", error.message);
      });
    }

    return NextResponse.json({
      ok: true,
      amount: reported,
      split: { creator: creatorAmount, fan_pool: fanPoolAmount, treasury: treasuryAmount },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Charge failed";
    console.error("[/api/payments/charge]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
