import Link from "next/link";

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-stadium/95 px-3 py-2 md:hidden">
      <div className="flex items-center justify-between text-xs text-chalk">
        <Link href="/feed">Stadium Feed</Link>
        <Link href="/upload">Enter the Pitch</Link>
        <Link href="/passport">Fan Passport</Link>
        <Link href="/leaderboards">Crowd Roar</Link>
      </div>
    </nav>
  );
}
