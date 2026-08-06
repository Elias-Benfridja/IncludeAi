interface MatchingToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export default function MatchingToggle({ enabled, onToggle, disabled = false }: MatchingToggleProps) {
  return (
    <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-6 shadow-[0_16px_32px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h4 className="text-headline-md text-[20px] text-on-surface mb-1">
            Find others working on similar tasks
          </h4>
          <p className="text-body-md text-on-surface-variant">
            Allows others to see your active task titles for matching.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={enabled}
          aria-label="Toggle task matching"
          disabled={disabled}
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
            enabled ? "bg-primary" : "bg-surface-variant"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}