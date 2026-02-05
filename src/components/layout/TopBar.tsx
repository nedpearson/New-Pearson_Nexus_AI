import React from "react";
import { Camera, Mic, Upload } from "lucide-react";

function Pill({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      className="glass rounded-2xl px-4 py-3 flex items-center gap-2 font-bold hover:bg-white/7 transition"
    >
      <span className="text-white/70">{icon}</span>
      <span className="text-sm">{label}</span>
    </a>
  );
}

export function TopBar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-30">
      <div className="px-4 md:pl-[120px] md:pr-6 pt-4">
        <div className="glass rounded-3xl px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="PearsonNexusAI" className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5" />
            <div className="min-w-0">
              <div className="font-black text-lg leading-5 truncate">PearsonNexusAI</div>
              <div className="text-xs text-white/60 truncate">Fun tiles • Simple capture • Everything organized</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Pill href="/capture" icon={<Camera className="h-4 w-4" />} label="Scan" />
            <Pill href="/capture" icon={<Upload className="h-4 w-4" />} label="Upload" />
            <Pill href="/capture" icon={<Mic className="h-4 w-4" />} label="Voice" />
          </div>

          <a
            className="md:hidden glass rounded-2xl px-4 py-3 font-black hover:bg-white/7 transition"
            href="/capture"
            title="Capture"
          >
            Capture
          </a>
        </div>
      </div>
    </header>
  );
}
