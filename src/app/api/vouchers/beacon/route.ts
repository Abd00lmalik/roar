import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAddress } from "viem";

const BeaconSchema = z.object({
  user:      z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  creator:   z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  totalOwed: z.string().regex(/^\d+$/),
  nonce:     z.string().regex(/^\d+$/),
});

export async function POST(req: NextRequest) {
  const body   = await req.json().catch(() => null);
  const parsed = BeaconSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(null, { status: 204 }); // beacon requires 2xx
  }

  const { user, creator, totalOwed, nonce } = parsed.data;

  const supabase = createClient();
  if (!supabase) {
    return new Response(null, { status: 204 });
  }

  await supabase.from("vouchers").insert({
    user_address:    getAddress(user),
    creator_address: getAddress(creator),
    total_owed:      totalOwed,
    nonce:           nonce,
    signature:       "unsigned", // sentinel value
    status:          "unsigned",
  });

  return new Response(null, { status: 204 });
}
