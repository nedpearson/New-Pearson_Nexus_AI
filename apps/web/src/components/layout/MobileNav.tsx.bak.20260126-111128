import React from "react";
import { LayoutGrid, Camera, FileText, DollarSign, Scale } from "lucide-react";

function Tab({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const active = typeof window !== "undefined" && window.location.pathname === href;
  return (
    <a
      href={href}
      className={[
        "flex-1 py-3 grid place-items-center gap-1 rounded-2xl transition",
        active ? "bg-white/8 ring-1 ring-white/15" : "hover:bg-white/6"
      ].join(" ")}
    >
      <div className="text-white/80">{icon}</div>
      <div className="text-[10px] font-black text-white/70">{label}</div>
    </a>
  );
}

export function MobileNav() {
  return (
    <div className="fixed left-0 right-0 bottom-0 z-30 md:hidden">
      <div className="px-4 pb-4">
        <div className="glass rounded-3xl p-2 flex items-stretch gap-2">
          <Tab href="/" icon={<LayoutGrid className="h-5 w-5" />} label="Home" />
          <Tab href="/capture" icon={<Camera className="h-5 w-5" />} label="Capture" />
          <Tab href="/documents" icon={<FileText className="h-5 w-5" />} label="Docs" />
          <Tab href="/finances" icon={<DollarSign className="h-5 w-5" />} label="Money" />
          <Tab href="/legal" icon={<Scale className="h-5 w-5" />} label="Legal" />
        </div>
      </div>
    </div>
  );
}
