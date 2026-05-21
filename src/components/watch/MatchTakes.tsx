export function MatchTakes() {
  return (
    <div className="glass-panel p-4">
      <h3 className="mb-2 font-semibold">Match Takes</h3>
      <p className="mb-3 text-sm text-chalk/70">NaijaStand breaking it down perfectly.</p>
      <textarea
        className="w-full rounded bg-black/40 p-2 text-sm"
        rows={3}
        placeholder="Drop your match take..."
      />
    </div>
  );
}
