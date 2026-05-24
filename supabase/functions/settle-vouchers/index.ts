import { createClient }        from "https://esm.sh/@supabase/supabase-js@2";
import { createWalletClient, createPublicClient, http, parseAbi, getAddress } from "https://esm.sh/viem@2";
import { privateKeyToAccount }  from "https://esm.sh/viem@2/accounts";

// ── Chain definition ──────────────────────────────────────────────────────────
const xlayerTestnet = {
  id:   1952,
  name: "OKX X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testrpc.xlayer.tech"] },
  },
} as const;

// ── Minimal ABI — only the functions this worker calls ────────────────────────
const VAULT_ABI = parseAbi([
  "function settleVoucher(address user, address creator, uint256 totalOwed, uint256 nonce, bytes calldata signature) external",
  "function nonces(address user) external view returns (uint256)",
  "event VoucherSettled(address indexed user, address indexed creator, uint256 totalOwed, uint256 creatorCut, uint256 fanCut, uint256 treasuryCut, uint256 nonce)",
]);

// ── Batch config ──────────────────────────────────────────────────────────────
const BATCH_SIZE = 10; // Process up to 10 vouchers per invocation

Deno.serve(async (_req: Request) => {
  // ── Environment validation ──────────────────────────────────────────────────
  const supabaseUrl       = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const settlerPrivateKey = Deno.env.get("SETTLER_PRIVATE_KEY");
  const vaultAddress      = Deno.env.get("VAULT_ADDRESS") as `0x${string}` | undefined;

  if (!supabaseUrl || !serviceRoleKey || !settlerPrivateKey || !vaultAddress) {
    return new Response(
      JSON.stringify({ error: "Missing required environment variables" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Clients ────────────────────────────────────────────────────────────────
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const account  = privateKeyToAccount(settlerPrivateKey as `0x${string}`);

  const publicClient = createPublicClient({
    chain:     xlayerTestnet,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain:     xlayerTestnet,
    transport: http(),
  });

  // ── Fetch pending vouchers ─────────────────────────────────────────────────
  const { data: vouchers, error: fetchError } = await supabase
    .from("vouchers")
    .select("id, user_address, creator_address, total_owed, nonce, signature")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchError) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch vouchers", detail: fetchError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!vouchers || vouchers.length === 0) {
    return new Response(
      JSON.stringify({ settled: 0, message: "No pending vouchers" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const results: { id: string; status: "settled" | "failed"; txHash?: string; error?: string }[] = [];

  for (const voucher of vouchers) {
    try {
      const user      = getAddress(voucher.user_address);
      const creator   = getAddress(voucher.creator_address);
      const totalOwed = BigInt(voucher.total_owed);
      const nonce     = BigInt(voucher.nonce);
      const signature = voucher.signature as `0x${string}`;

      // Guard: verify on-chain nonce matches before attempting settlement
      // Prevents gas waste on already-settled or replayed vouchers
      const onChainNonce = await publicClient.readContract({
        address:      vaultAddress,
        abi:          VAULT_ABI,
        functionName: "nonces",
        args:         [user],
      });

      if (onChainNonce !== nonce) {
        // Mark as failed — nonce mismatch (likely already settled or replayed)
        await supabase
          .from("vouchers")
          .update({ status: "failed" })
          .eq("id", voucher.id);

        results.push({
          id:     voucher.id,
          status: "failed",
          error:  `Nonce mismatch: on-chain=${onChainNonce}, voucher=${nonce}`,
        });
        continue;
      }

      // Submit settlement transaction
      const txHash = await walletClient.writeContract({
        address:      vaultAddress,
        abi:          VAULT_ABI,
        functionName: "settleVoucher",
        args:         [user, creator, totalOwed, nonce, signature],
      });

      // Wait for confirmation (1 block)
      const receipt = await publicClient.waitForTransactionReceipt({
        hash:               txHash,
        confirmations:      1,
        timeout:            60_000,
      });

      if (receipt.status === "success") {
        await supabase
          .from("vouchers")
          .update({
            status:      "settled",
            tx_hash:     txHash,
            settled_at:  new Date().toISOString(),
          })
          .eq("id", voucher.id);

        results.push({ id: voucher.id, status: "settled", txHash });
      } else {
        // Transaction reverted on-chain
        await supabase
          .from("vouchers")
          .update({ status: "failed" })
          .eq("id", voucher.id);

        results.push({ id: voucher.id, status: "failed", error: "Transaction reverted" });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);

      await supabase
        .from("vouchers")
        .update({ status: "failed" })
        .eq("id", voucher.id);

      results.push({ id: voucher.id, status: "failed", error: message });
    }
  }

  const settled = results.filter((r) => r.status === "settled").length;
  const failed  = results.filter((r) => r.status === "failed").length;

  return new Response(
    JSON.stringify({ settled, failed, results }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
