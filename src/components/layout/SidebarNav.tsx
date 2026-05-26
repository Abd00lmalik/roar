import Link from "next/link";
import { GlassPanel } from "@/components/shared/GlassPanel";

const navLinks = [
  ["Stadium Feed 🏟️", "/stadium"],
  ["Crowd RoarTube", "/leaderboards"],
  ["Enter the Pitch ⚽", "/upload"],
  ["Fan Passport 🛂", "/passport"],
  ["Goal Earnings", "/earnings"],
  ["Badge Gallery", "/badges"],
];

export function SidebarNav() {
  return (
    <GlassPanel className="hidden h-fit p-3 lg:block">
      <ul className="space-y-2">
        {navLinks.map(([label, href]) => (
          <li key={href}>
            <Link className="block rounded px-3 py-2 text-sm hover:bg-white/10" href={href}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}
