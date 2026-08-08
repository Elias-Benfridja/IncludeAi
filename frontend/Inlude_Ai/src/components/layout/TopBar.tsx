import { useNavigate } from "react-router-dom";

interface TopBarProps {
  pointsBalance?: number;
  showBack?: boolean;
}


export default function TopBar({ pointsBalance, showBack = false }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center h-16 px-container-margin bg-surface shadow-[0_16px_32px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
        ) : (
          <span
            className="material-symbols-outlined text-primary text-[28px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            spa
          </span>
        )}
        <h1 className="font-semibold text-headline-md text-primary tracking-tight">
          Simplify
        </h1>
      </div>

      {pointsBalance !== undefined && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-secondary-container rounded-full">
          <span
            className="material-symbols-outlined text-on-secondary-container text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            stars
          </span>
          <span className="text-label-lg text-on-secondary-container">
            {pointsBalance} pts
          </span>
        </div>
      )}
    </header>
  );
}
