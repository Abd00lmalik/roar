"use client";

import { useAccount } from "wagmi";

const reactions = [
  "🌶️ Hot Take",
  "📊 Great Analysis",
  "😂 Banter",
  "🧠 Tactical",
  "🙅 Disagree",
  "🏆 Lift the Cup",
];

export function ReactionBar() {
  const { isConnected } = useAccount();

  return (
    <div className="glass-panel p-3">
      <div className="flex flex-wrap gap-2 text-xs">
        {reactions.map((reaction) => (
          <button
            key={reaction}
            disabled={!isConnected}
            title={isConnected ? `React with ${reaction}` : "Connect wallet to react"}
            className="rounded bg-white/10 px-2 py-1 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 transition-colors relative group"
          >
            {reaction}
            {!isConnected && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black/95 text-[10px] text-chalk px-2 py-1 rounded whitespace-nowrap z-30 border border-white/10">
                Connect wallet to join
              </span>
            )}
          </button>
        ))}

        <button
          disabled={!isConnected}
          title={isConnected ? "Save to locker" : "Connect wallet to save"}
          className="rounded bg-floodlight/20 border border-floodlight/30 px-2 py-1 text-floodlight hover:bg-floodlight/30 disabled:opacity-40 disabled:hover:bg-floodlight/20 transition-colors relative group font-medium"
        >
          🗄️ Keep in Locker
          {!isConnected && (
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black/95 text-[10px] text-chalk px-2 py-1 rounded whitespace-nowrap z-30 border border-white/10">
              Connect wallet to join
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
