import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans, JetBrains_Mono } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { AppShell } from "@/components/layout/AppShell";

const display = Barlow_Condensed({
  variable: "--font-display",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

const body = DM_Sans({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roarball",
  description: "The football-native live streaming platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var raw = document.cookie.split('; ')
                    .find(function(row) { return row.startsWith('roar_theme='); });
                  if (!raw) return;
                  var parsed = JSON.parse(decodeURIComponent(raw.split('=')[1]));
                  var root = document.documentElement;
                  root.style.setProperty('--country-from', parsed.from);
                  root.style.setProperty('--country-via', parsed.via);
                  root.style.setProperty('--country-to', parsed.to);
                  root.style.setProperty('--country-accent', parsed.accent);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-[#0a0a0f] text-chalk">
        <div className="stadium-floodlight min-h-screen">
          <AppProviders>
            <AppShell>{children}</AppShell>
          </AppProviders>
        </div>
      </body>
    </html>
  );
}
