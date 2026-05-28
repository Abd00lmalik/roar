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
  title: "RoarTube",
  description: "Where football attention becomes creator revenue.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
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
                    FR: { from:'#002395', via:'#FFFFFF', to:'#ED2939', accent:'#ED2939' },
                    PT: { from:'#006600', via:'#FF0000', to:'#006600', accent:'#FF0000' },
                    NL: { from:'#AE1C28', via:'#FFFFFF', to:'#21468B', accent:'#AE1C28' },
                    BE: { from:'#000000', via:'#FAE042', to:'#EF3340', accent:'#FAE042' },
                    ENG: { from:'#FFFFFF', via:'#CF142B', to:'#FFFFFF', accent:'#CF142B' },
                    'GB-ENG': { from:'#FFFFFF', via:'#CF142B', to:'#FFFFFF', accent:'#CF142B' },
                    EN: { from:'#FFFFFF', via:'#CF142B', to:'#FFFFFF', accent:'#CF142B' },
                    HR: { from:'#FF0000', via:'#FFFFFF', to:'#171796', accent:'#FF0000' },
                    AT: { from:'#ED2939', via:'#FFFFFF', to:'#ED2939', accent:'#ED2939' },
                    HU: { from:'#CE2939', via:'#FFFFFF', to:'#477050', accent:'#CE2939' },
                    CH: { from:'#FF0000', via:'#FFFFFF', to:'#FF0000', accent:'#FFFFFF' },
                    RS: { from:'#C6363C', via:'#0C4076', to:'#FFFFFF', accent:'#C6363C' },
                    DK: { from:'#C60C30', via:'#FFFFFF', to:'#C60C30', accent:'#FFFFFF' },
                    SK: { from:'#FFFFFF', via:'#0B4EA2', to:'#EE1C25', accent:'#0B4EA2' },
                    AL: { from:'#E41E20', via:'#000000', to:'#E41E20', accent:'#E41E20' },
                    GR: { from:'#0D5EAF', via:'#FFFFFF', to:'#0D5EAF', accent:'#FFFFFF' },
                    AR: { from:'#74ACDF', via:'#FFFFFF', to:'#74ACDF', accent:'#74ACDF' },
                    BR: { from:'#009C3B', via:'#FFDF00', to:'#002776', accent:'#FFDF00' },
                    CO: { from:'#FCD116', via:'#003893', to:'#CE1126', accent:'#FCD116' },
                    UY: { from:'#5EB6E4', via:'#FFFFFF', to:'#5EB6E4', accent:'#5EB6E4' },
                    EC: { from:'#FFD100', via:'#003580', to:'#EF3340', accent:'#FFD100' },
                    VE: { from:'#CF142B', via:'#003893', to:'#CF142B', accent:'#FCD116' },
                    US: { from:'#B22234', via:'#FFFFFF', to:'#3C3B6E', accent:'#B22234' },
                    MX: { from:'#006847', via:'#FFFFFF', to:'#CE1126', accent:'#006847' },
                    CA: { from:'#FF0000', via:'#FFFFFF', to:'#FF0000', accent:'#FF0000' },
                    PA: { from:'#FFFFFF', via:'#005293', to:'#DA121A', accent:'#005293' },
                    HN: { from:'#0073CF', via:'#FFFFFF', to:'#0073CF', accent:'#0073CF' },
                    JM: { from:'#000000', via:'#FED100', to:'#009B3A', accent:'#FED100' },
                    MA: { from:'#C1272D', via:'#006233', to:'#C1272D', accent:'#006233' },
                    EG: { from:'#CE1126', via:'#FFFFFF', to:'#000000', accent:'#CE1126' },
                    SN: { from:'#00853F', via:'#FDEF42', to:'#E31B23', accent:'#FDEF42' },
                    ZA: { from:'#007A4D', via:'#FFB612', to:'#002395', accent:'#FFB612' },
                    CI: { from:'#F77F00', via:'#FFFFFF', to:'#009A44', accent:'#F77F00' },
                    GH: { from:'#006B3F', via:'#FCD116', to:'#CE1126', accent:'#FCD116' },
                    TN: { from:'#E70013', via:'#FFFFFF', to:'#E70013', accent:'#E70013' },
                    ML: { from:'#14B53A', via:'#FCD116', to:'#CE1126', accent:'#FCD116' },
                    DZ: { from:'#006233', via:'#FFFFFF', to:'#006233', accent:'#D21034' },
                    JP: { from:'#BC002D', via:'#FFFFFF', to:'#BC002D', accent:'#BC002D' },
                    KR: { from:'#003478', via:'#FFFFFF', to:'#CD2E3A', accent:'#CD2E3A' },
                    IR: { from:'#239F40', via:'#FFFFFF', to:'#DA0000', accent:'#239F40' },
                    SA: { from:'#006C35', via:'#FFFFFF', to:'#006C35', accent:'#FFFFFF' },
                    AU: { from:'#00008B', via:'#FFFFFF', to:'#FF0000', accent:'#FF0000' },
                    UZ: { from:'#1EB53A', via:'#FFFFFF', to:'#CE1126', accent:'#1EB53A' },
                    QA: { from:'#8D1B3D', via:'#FFFFFF', to:'#8D1B3D', accent:'#FFFFFF' },
                    JO: { from:'#007A3D', via:'#FFFFFF', to:'#CE1126', accent:'#CE1126' },
                    NZ: { from:'#00247D', via:'#FFFFFF', to:'#CC142B', accent:'#CC142B' },
                    CD: { from:'#007FFF', via:'#F7D900', to:'#CE1126', accent:'#F7D900' },
                    IQ: { from:'#CE1126', via:'#FFFFFF', to:'#000000', accent:'#007A3D' }
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
