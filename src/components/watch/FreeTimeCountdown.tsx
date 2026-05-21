import { formatSeconds } from "@/lib/utils";

export function FreeTimeCountdown({ remaining }: { remaining: number }) {
  const tone = remaining <= 10 ? "text-red-400" : remaining <= 30 ? "text-amber-300" : "text-green-400";
  return (
    <div className={`rounded-full bg-black/70 px-3 py-1 text-sm ${tone}`}>
      🟢 Free stadium time: {formatSeconds(remaining)}
    </div>
  );
}
