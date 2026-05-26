"use client";

import { useSession } from "next-auth/react";
import { useOnChainLeaderboard, useCurrentWeekId } from "@/hooks/useLeaderboard";
import { getTeamByCode } from "@/lib/data/wc2026-teams";
import { ADDRESSES, contractsConfigured } from "@/lib/xlayer/addresses";

interface CountryLeaderboardProps {
  /** ISO country code to display leaderboard for, e.g. "BR" */
  countryCode: string;
  /** Override week ID — defaults to current on-chain week */
  weekId?: bigint;
  /** Prize pool size in USDC for display */
  prizePoolUSDC?: number;
}

function formatWatchTime(seconds: bigint): string {
  const s = Number(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function CountryLeaderboard({
  countryCode,
  weekId: weekIdProp,
  prizePoolUSDC = 0,
}: CountryLeaderboardProps) {
  const { data: session } = useSession();
  const currentWeekId = useCurrentWeekId();
  const resolvedWeekId = weekIdProp ?? currentWeekId;
  const { board, loading, error } = useOnChainLeaderboard(resolvedWeekId, countryCode);

  const team = getTeamByCode(countryCode);
  const explorerUrl = ADDRESSES.WATCH_LEADERBOARD
    ? `https://www.okx.com/web3/explorer/xlayer-test/address/${ADDRESSES.WATCH_LEADERBOARD}`
    : null;

  const userWallet = session?.user?.walletAddress?.toLowerCase();

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: team
          ? `linear-gradient(160deg, ${team.colors.from}18 0%, rgba(10,10,15,0.95) 60%)`
          : "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {/* Accent bar */}
      <div
        className="h-0.5 w-full"
        style={{ background: team?.colors.accent ?? "#e94560" }}
      />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{team?.emoji ?? "🌍"}</span>
            <div>
              <h3 className="font-display font-bold text-white text-lg leading-tight">
                {team?.name ?? countryCode} Fan Leaderboard
              </h3>
              <p className="text-xs text-white/40">
                Week {resolvedWeekId !== null ? resolvedWeekId?.toString() : "—"} ·{" "}
                <span className="text-white/30">Verified on X Layer · Chain ID 1952</span>
              </p>
            </div>
          </div>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
              style={{ color: team?.colors.accent ?? undefined }}
            >
              Explorer ↗
            </a>
          )}
        </div>

        {/* Board */}
        {loading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-9 rounded-lg animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-4 text-white/30 text-sm">
            {contractsConfigured()
              ? "Leaderboard data unavailable"
              : "Contracts not yet deployed"}
          </div>
        )}

        {!loading && !error && board.length === 0 && (
          <div className="text-center py-6 space-y-2">
            <div className="text-3xl">🏆</div>
            <p className="text-white/40 text-sm">
              No rankings yet for this week.
            </p>
            <p className="text-white/25 text-xs">
              Watch streams to climb the leaderboard.
            </p>
          </div>
        )}

        {!loading && board.length > 0 && (
          <div className="space-y-1.5">
            {board.map((entry) => {
              const isUser = userWallet && entry.wallet.toLowerCase() === userWallet;
              return (
                <div
                  key={entry.wallet}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
                  style={{
                    background: isUser
                      ? `${team?.colors.accent ?? "#e94560"}22`
                      : "rgba(255,255,255,0.03)",
                    border: isUser
                      ? `1px solid ${team?.colors.accent ?? "#e94560"}44`
                      : "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Rank */}
                  <span className="w-6 text-center text-sm flex-shrink-0">
                    {entry.rank <= 3 ? MEDALS[entry.rank - 1] : (
                      <span className="text-white/40 font-mono text-xs">
                        {entry.rank}.
                      </span>
                    )}
                  </span>

                  {/* Wallet address */}
                  <span className="flex-1 font-mono text-xs text-white/70 truncate">
                    {truncateAddress(entry.wallet)}
                    {isUser && (
                      <span
                        className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: team?.colors.accent ?? "#e94560",
                          color: "#fff",
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </span>

                  {/* Watch time */}
                  <span className="text-xs font-mono text-white/60 flex-shrink-0">
                    {formatWatchTime(entry.watchSeconds)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div>
            <p className="text-xs text-white/30 font-medium">Prize Pool</p>
            <p className="text-sm font-mono font-bold text-white">
              {prizePoolUSDC > 0 ? `${prizePoolUSDC.toFixed(2)} USDC` : "—"}
            </p>
          </div>
          <p className="text-xs text-white/25 text-right max-w-[140px] leading-relaxed">
            Distributed at end of match week
          </p>
        </div>
      </div>
    </div>
  );
}
