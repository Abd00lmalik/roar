// src/app/api/vouchers/sink/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recoverTypedDataAddress, getAddress } from "viem";
import { createClient } from "@/lib/supabase/server";

const VoucherSchema = z.object({
  user:      z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  creator:   z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  totalOwed: z.string().regex(/^\d+$/),
  nonce:     z.string().regex(/^\d+$/),
  signature: z.string().regex(/^0x[0-9a-fA-F]{130}$/),
});

const DOMAIN = {
  name:              "RoarballVault",
  version:           "1",
  chainId:           1952,
  verifyingContract: process.env.VAULT_ADDRESS as `0x${string}`,
} as const;

const TYPES = {
  WatchVoucher: [
    { name: "user",      type: "address" },
    { name: "creator",   type: "address" },
    { name: "totalOwed", type: "uint256" },
    { name: "nonce",     type: "uint256" },
  ],
} as const;

export async function POST(req: NextRequest) {
  const body   = await req.json().catch(() => null);
  const parsed = VoucherSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid voucher payload" }, { status: 400 });
  }

  const { user, creator, totalOwed, nonce, signature } = parsed.data;

  // Server-side EIP-712 signature re-verification
  const recovered = await recoverTypedDataAddress({
    domain:      DOMAIN,
    types:       TYPES,
    primaryType: "WatchVoucher",
    message: {
      user:      user as `0x${string}`,
      creator:   creator as `0x${string}`,
      totalOwed: BigInt(totalOwed),
      nonce:     BigInt(nonce),
    },
    signature: signature as `0x${string}`,
  });

  if (getAddress(recovered) !== getAddress(user)) {
    return NextResponse.json({ error: "Signature mismatch" }, { status: 401 });
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("vouchers")
    .upsert({
      user_address:    getAddress(user),
      creator_address: getAddress(creator),
      total_owed:      totalOwed,
      nonce:           nonce,
      signature:       signature,
      status:          "pending",
    }, {
      onConflict: "user_address,nonce"
    })
    .select("id")
    .single();

  if (error) {
    // Duplicate nonce = replay attempt
    if (error.code === "23505") {
      return NextResponse.json({ error: "Voucher already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Storage failed" }, { status: 500 });
  }

  return NextResponse.json({ voucherId: data.id }, { status: 201 });
}
