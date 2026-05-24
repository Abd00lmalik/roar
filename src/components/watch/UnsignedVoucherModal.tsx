"use client";

interface UnsignedVoucherModalProps {
  totalOwed:  string; // human-readable USDC string e.g. "0.045"
  onSign:     () => Promise<void>;
  onDismiss:  () => void;
  loading:    boolean;
}

export function UnsignedVoucherModal({
  totalOwed,
  onSign,
  onDismiss,
  loading,
}: UnsignedVoucherModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 max-w-sm w-full mx-4 space-y-4">
        <div className="text-center space-y-1">
          <span className="text-3xl">🎒</span>
          <h2 className="text-base font-semibold text-white">Unsigned Match Payment</h2>
          <p className="text-sm text-white/50">
            You have an unsigned watch payment of{" "}
            <span className="text-[var(--country-accent)] font-medium">{totalOwed} USDC</span>{" "}
            from your last session. Sign now to send it to the creator.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            disabled={loading}
            className="flex-1 py-2 rounded-xl bg-white/[0.06] text-white/60 text-sm font-medium hover:bg-white/[0.10] transition-colors disabled:opacity-40"
          >
            Dismiss
          </button>
          <button
            onClick={onSign}
            disabled={loading}
            className="flex-1 py-2 rounded-xl bg-[var(--country-accent)] text-black text-sm font-semibold disabled:opacity-40 transition-opacity"
          >
            {loading ? "Signing..." : "Sign & Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
