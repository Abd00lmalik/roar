import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans, JetBrains_Mono } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ThemeRestore } from "@/components/providers/ThemeRestore";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var country = document.cookie.split('; ').find(function(r) {
                    return r.startsWith('supporter_nation=');
                  });
                  if (!country) return;
                  var code = country.split('=')[1];
                  var themes = {
                    DE: { from:'#000000', via:'#DD0000', to:'#FFCE00', accent:'#FFCE00' },
                    ES: { from:'#AA151B', via:'#F1BF00', to:'#AA151B', accent:'#F1BF00' },
                    FR: { from:'#002395', via:'#EDEDED', to:'#ED2939', accent:'#ED2939' },
                    PT: { from:'#006600', via:'#FF0000', to:'#FFD700', accent:'#FFD700' },
                    NL: { from:'#AE1C28', via:'#FFFFFF', to:'#21468B', accent:'#FF4F00' },
                    BE: { from:'#000000', via:'#FDDA0D', to:'#EF3340', accent:'#EF3340' },
                    EN: { from:'#FFFFFF', via:'#CF0820', to:'#FFFFFF', accent:'#CF0820' },
                    HR: { from:'#FF0000', via:'#FFFFFF', to:'#171796', accent:'#FF0000' },
                    AT: { from:'#ED2939', via:'#FFFFFF', to:'#ED2939', accent:'#ED2939' },
                    HU: { from:'#CE1126', via:'#FFFFFF', to:'#477050', accent:'#CE1126' },
                    CH: { from:'#FF0000', via:'#FFFFFF', to:'#FF0000', accent:'#FF0000' },
                    RS: { from:'#C6363C', via:'#0C4076', to:'#FFFFFF', accent:'#D4A373' },
                    DK: { from:'#C8102E', via:'#FFFFFF', to:'#C8102E', accent:'#C8102E' },
                    SK: { from:'#FFFFFF', via:'#0B4EA2', to:'#EE1C25', accent:'#EE1C25' },
                    AL: { from:'#E41B13', via:'#000000', to:'#E41B13', accent:'#E41B13' },
                    GR: { from:'#0D5EAF', via:'#FFFFFF', to:'#0D5EAF', accent:'#0D5EAF' },
                    AR: { from:'#74ACDF', via:'#FFFFFF', to:'#74ACDF', accent:'#F6B40E' },
                    BR: { from:'#009C3B', via:'#FFDF00', to:'#002776', accent:'#FFDF00' },
                    CO: { from:'#FCD116', via:'#003893', to:'#CE1126', accent:'#FCD116' },
                    UY: { from:'#0081C6', via:'#FFFFFF', to:'#FCD116', accent:'#FCD116' },
                    EC: { from:'#FFD700', via:'#003087', to:'#DA291C', accent:'#FFD700' },
                    VE: { from:'#FCD116', via:'#003893', to:'#CE1126', accent:'#FCD116' },
                    US: { from:'#B22234', via:'#FFFFFF', to:'#3C3B6E', accent:'#B22234' },
                    MX: { from:'#006847', via:'#FFFFFF', to:'#CE1126', accent:'#006847' },
                    CA: { from:'#FF0000', via:'#FFFFFF', to:'#FF0000', accent:'#FF0000' },
                    PA: { from:'#002F6C', via:'#FFFFFF', to:'#D21034', accent:'#D21034' },
                    HN: { from:'#0073CF', via:'#FFFFFF', to:'#0073CF', accent:'#0073CF' },
                    JM: { from:'#009B3A', via:'#000000', to:'#FCD116', accent:'#FCD116' },
                    MA: { from:'#C1272D', via:'#006233', to:'#C1272D', accent:'#006233' },
                    EG: { from:'#CE1126', via:'#FFFFFF', to:'#000000', accent:'#C09300' },
                    SN: { from:'#00853F', via:'#FDEF42', to:'#E31B23', accent:'#FDEF42' },
                    ZA: { from:'#007A4D', via:'#FFB612', to:'#000000', accent:'#FFB612' },
                    CI: { from:'#FF8200', via:'#FFFFFF', to:'#009A44', accent:'#FF8200' },
                    GH: { from:'#CE1126', via:'#FCD116', to:'#006B3F', accent:'#FCD116' },
                    TN: { from:'#E41B13', via:'#FFFFFF', to:'#E41B13', accent:'#E41B13' },
                    ML: { from:'#14B53A', via:'#FED105', to:'#E51D28', accent:'#FED105' },
                    DZ: { from:'#006233', via:'#FFFFFF', to:'#D21034', accent:'#D21034' },
                    JP: { from:'#BC002D', via:'#FFFFFF', to:'#BC002D', accent:'#BC002D' },
                    KR: { from:'#FFFFFF', via:'#003478', to:'#CD2E3A', accent:'#CD2E3A' },
                    IR: { from:'#239F40', via:'#FFFFFF', to:'#DA251D', accent:'#239F40' },
                    SA: { from:'#006C35', via:'#FFFFFF', to:'#006C35', accent:'#006C35' },
                    AU: { from:'#00008B', via:'#FFFFFF', to:'#FFFFFF', accent:'#FFD700' },
                    UZ: { from:'#00AEF0', via:'#FFFFFF', to:'#1EB53A', accent:'#00AEF0' },
                    QA: { from:'#8A1538', via:'#FFFFFF', to:'#8A1538', accent:'#8A1538' },
                    JO: { from:'#000000', via:'#FFFFFF', to:'#1A9345', accent:'#E60000' },
                    NZ: { from:'#000000', via:'#FFFFFF', to:'#000000', accent:'#FFFFFF' },
                    TBD_A: { from:'#4B5563', via:'#1F2937', to:'#9CA3AF', accent:'#FFFFFF' },
                    TBD_B: { from:'#4B5563', via:'#1F2937', to:'#9CA3AF', accent:'#FFFFFF' }
                  };
                  var t = themes[code];
                  if (!t) return;
                  var r = document.documentElement;
                  r.style.setProperty('--country-from',   t.from);
                  r.style.setProperty('--country-via',    t.via);
                  r.style.setProperty('--country-to',     t.to);
                  r.style.setProperty('--country-accent', t.accent);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-[#0a0a0f] text-chalk">
        <div className="stadium-floodlight min-h-screen">
          <AppProviders>
            <ThemeRestore />
            <div className="min-h-screen pb-16 md:pb-0">
              <Navbar />
              <main>{children}</main>
              <BottomNav />
            </div>
          </AppProviders>
        </div>
      </body>
    </html>
  );
}
