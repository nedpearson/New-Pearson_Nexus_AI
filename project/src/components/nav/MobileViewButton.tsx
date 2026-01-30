interface MobileViewButtonProps {
  onNavigate: (route: string) => void;
  className?: string;
}

export function MobileViewButton({ onNavigate, className = "" }: MobileViewButtonProps) {
  return (
    <button
      type="button"
      className={`px-3 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 transition ${className}`}
      onClick={() => onNavigate("mobile")}
      title="Open mobile-optimized view"
    >
      Mobile View
    </button>
  );
}
