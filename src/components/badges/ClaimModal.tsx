export function ClaimModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="glass-panel space-y-3 p-5 text-center">
        <div className="text-5xl">🏆</div>
        <p className="font-semibold">Trophy Claimed</p>
        <button className="rounded bg-white/10 px-3 py-1 text-sm" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
