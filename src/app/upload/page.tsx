"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FootballButton } from "@/components/shared/FootballButton";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSession } from "next-auth/react";
import { xLayerPublicClient } from "@/lib/xlayer/client";
import { COUNTRIES } from "@/lib/theme/countries";
import { formatEther } from "viem";
import { useRef } from "react";
import { CountryFlag } from "@/components/ui/CountryFlag";

export default function UploadPage() {
  const { isConnected, address: connectedAddress } = useAccount();
  const { data: session } = useSession();
  const router = useRouter();

  // File & Form state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [associatedCountry, setAssociatedCountry] = useState("");
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
  const countrySelectRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (countrySelectRef.current && !countrySelectRef.current.contains(e.target as Node)) {
        setCountrySelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);
  
  // Loading & Balance state
  const [loading, setLoading] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState(true);
  const [okbBalance, setOkbBalance] = useState<bigint | null>(null);
  const [copied, setCopied] = useState(false);

  const walletAddress = connectedAddress ?? session?.user?.walletAddress ?? null;

  // Fetch OKB balance on mount or wallet update
  const fetchBalance = async () => {
    if (!walletAddress) {
      setCheckingBalance(false);
      return;
    }
    setCheckingBalance(true);
    try {
      const bal = await xLayerPublicClient.getBalance({
        address: walletAddress as `0x${string}`,
      });
      setOkbBalance(bal);
    } catch (err) {
      console.error("[Upload] failed to fetch OKB balance:", err);
    } finally {
      setCheckingBalance(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [walletAddress]);

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !file || !category) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("tags", tagsInput);
    formData.append("associatedCountry", associatedCountry);

    try {
      const res = await fetch("/api/video/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.id) {
        router.push(`/watch/${data.id}`);
      } else {
        alert(data.error || "Failed to upload video");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during video upload");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected && !session?.user?.id) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-12 text-center space-y-4">
        <h1 className="font-display text-3xl font-bold">Enter the Pitch ⚽</h1>
        <div className="glass-panel p-6 space-y-4 bg-stadium/80">
          <p className="text-sm text-chalk/70">
            Sign in with Google or connect your wallet to start uploading videos and earning.
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  if (checkingBalance) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-white">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-[var(--country-accent,#FFCC00)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/60 text-sm">Verifying X Layer gas balance...</p>
        </div>
      </div>
    );
  }

  // OKB Balance Gate
  const hasOKB = okbBalance !== null && okbBalance > BigInt(0);
  if (!hasOKB) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4 py-8">
        <div className="glass-panel p-8 max-w-md w-full text-center space-y-6 bg-stadium/80 border-amber-500/20 shadow-2xl">
          <div className="text-5xl animate-bounce">⛽</div>
          <h2 className="text-2xl font-bold text-white font-display">
            You need OKB to upload
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Uploading content requires a small amount of OKB for gas fees on the X Layer network. 
            OKB is free to request from the testnet faucet.
          </p>
          
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 text-left space-y-3">
            <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-white/50">
              How to get OKB:
            </h3>
            <ol className="space-y-2.5 text-white/80 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[var(--country-accent,#FFCE00)] font-bold">1.</span>
                <span className="flex-1">
                  Copy your wallet address:
                  <div className="mt-1 flex items-center gap-2">
                    <code className="bg-white/10 px-2 py-1 rounded text-xs font-mono break-all select-all flex-1">
                      {walletAddress}
                    </code>
                    <button 
                      onClick={handleCopy}
                      className="text-xs bg-white/15 px-2 py-1 rounded hover:bg-white/20 transition-all font-semibold active:scale-95 cursor-pointer"
                    >
                      {copied ? "Copied! ✓" : "Copy"}
                    </button>
                  </div>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--country-accent,#FFCE00)] font-bold">2.</span>
                <span>Go to the X Layer faucet and paste your address.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--country-accent,#FFCE00)] font-bold">3.</span>
                <span>Return here once received (takes ~30 seconds).</span>
              </li>
            </ol>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="https://www.okx.com/xlayer/faucet"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-[var(--country-accent,#FFCE00)] hover:brightness-110 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 text-sm inline-block shadow-lg text-center"
            >
              Get Free OKB from Faucet →
            </a>

            <button 
              onClick={fetchBalance}
              className="w-full py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl transition-all active:scale-95 text-sm cursor-pointer border border-white/10"
            >
              I've got OKB — Check Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-6 font-display text-4xl font-black italic tracking-tight text-white flex items-center gap-2">
        <span>📹</span> Enter the Pitch
      </h1>
      
      <div className="glass-panel space-y-5 p-6 bg-stadium/80 shadow-2xl">
        {/* File upload */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Video File *
          </label>
          <input
            name="file"
            type="file"
            accept="video/*"
            className="w-full text-sm bg-black/40 border border-white/10 p-3 rounded-lg file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white file:cursor-pointer hover:file:bg-white/15 cursor-pointer text-white/60"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                setFile(files[0]);
              }
            }}
            required
          />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Title *
          </label>
          <input
            name="title"
            className="w-full rounded-lg bg-black/40 border border-white/10 p-3 text-white focus:border-white/20 transition-all outline-none"
            placeholder="World Cup Final 2026 tactical analysis..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Description
          </label>
          <textarea
            name="description"
            className="w-full rounded-lg bg-black/40 border border-white/10 p-3 text-white focus:border-white/20 transition-all outline-none"
            placeholder="A deep dive into the match tactics..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Category selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Category *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["highlights", "documentary", "preview", "reaction", "culture", "tactical"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium capitalize transition-colors cursor-pointer border
                  ${category === cat
                    ? "bg-[var(--country-accent)] text-black border-[var(--country-accent)] shadow-[0_0_15px_rgba(255,206,0,0.15)] font-semibold"
                    : "bg-white/[0.04] text-white/60 border-white/5 hover:bg-white/[0.08] hover:text-white"
                  }`}
              >
                {cat === "preview" ? "match preview" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tags input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Tags * (comma separated)
          </label>
          <input
            type="text"
            placeholder="e.g. argentina, messi, final, 2026"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            required
            className="w-full rounded-lg bg-black/40 border border-white/10 p-3 text-white focus:border-white/20 transition-all outline-none"
          />
          <p className="text-xs text-white/40 leading-relaxed">
            Tags help fans find your content. Add your country, players, or match name.
          </p>
        </div>

        {/* Associated Country */}
        {/* Associated Country */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Associated Country
          </label>
          <div className="relative w-full" ref={countrySelectRef}>
            <button
              type="button"
              onClick={() => setCountrySelectOpen(!countrySelectOpen)}
              className="w-full rounded-lg bg-black/40 border border-white/10 p-3 text-white focus:border-white/20 transition-all outline-none cursor-pointer text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                {associatedCountry ? (
                  <>
                    <CountryFlag code={associatedCountry} className="w-5 h-3.5 object-cover rounded-sm shadow-sm inline-block" />
                    <span>{COUNTRIES.find((c) => c.code === associatedCountry)?.name}</span>
                  </>
                ) : (
                  <span>All countries / General</span>
                )}
              </span>
              <span className="text-white/40 text-xs select-none">▼</span>
            </button>

            {countrySelectOpen && (
              <div className="absolute left-0 right-0 mt-1 max-h-[220px] overflow-y-auto z-50 rounded border border-white/15 bg-slate-900 shadow-2xl p-1 space-y-0.5 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    setAssociatedCountry("");
                    setCountrySelectOpen(false);
                  }}
                  className={`w-full rounded p-2.5 text-xs text-left hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer text-white ${
                    !associatedCountry ? "bg-white/5 font-semibold" : ""
                  }`}
                >
                  All countries / General
                </button>
                {COUNTRIES.filter(c => !c.code.startsWith("TBD") && c.confederation !== "PLAYOFF").map((t) => (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() => {
                      setAssociatedCountry(t.code);
                      setCountrySelectOpen(false);
                    }}
                    className={`w-full rounded p-2.5 text-xs text-left hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer text-white ${
                      associatedCountry === t.code ? "bg-white/5 font-semibold text-[var(--country-accent)]" : ""
                    }`}
                  >
                    <CountryFlag code={t.code} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <p className="text-sm text-chalk/70">
            Universal price: 0.0001 USDC/sec · Your earnings: 85% of every paid second watched
          </p>
          <p className="text-xs text-amber-200">
            ⚠️ Only upload content you own or have permission to share.
          </p>
        </div>

        <FootballButton 
          disabled={loading || !file || !title.trim() || !category} 
          onClick={handleSubmit}
        >
          {loading ? "Uploading content..." : "Enter the Pitch ⚽"}
        </FootballButton>
      </div>
    </div>
  );
}
