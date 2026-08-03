import type { Subtask } from "../../types";

interface SubtaskItemProps {
  subtask: Subtask;
  isCurrent?: boolean;
  isExpanding?: boolean;
  onComplete: (id: number) => void;
  onExpand: (id: number) => void;
}

export default function SubtaskItem({
  subtask,
  isCurrent = false,
  isExpanding = false,
  onComplete,
  onExpand,
}: SubtaskItemProps) {
  return (
    <div
      className={`flex items-center flex-wrap gap-3 gap-y-2 p-4 rounded-xl border transition-all ${
        subtask.completed
          ? "bg-surface-container-lowest border-tertiary-fixed opacity-80"
          : isCurrent
          ? "bg-white border-2 border-primary shadow-[0_16px_32px_rgba(0,0,0,0.04)]"
          : "bg-surface-container-lowest border-tertiary-fixed"
      }`}
    >
      <label className="relative flex items-center justify-center cursor-pointer min-w-[48px] min-h-[48px]">
        <input
          type="checkbox"
          checked={subtask.completed}
          disabled={subtask.completed}
          onChange={() => onComplete(subtask.id)}
          className="peer sr-only"
        />
        <span
          className={`w-7 h-7 border-2 rounded-lg flex items-center justify-center transition-colors ${
            subtask.completed ? "bg-primary border-primary" : "border-outline-variant"
          }`}
        >
          {subtask.completed && (
            <span className="material-symbols-outlined text-white text-[18px]">check</span>
          )}
        </span>
      </label>

      <div className="grow min-w-35">
        <p
          className={`text-body-md ${
            subtask.completed
              ? "line-through opacity-60 text-on-surface-variant"
              : isCurrent
              ? "font-semibold text-on-surface"
              : "text-on-surface"
          }`}
        >
          {subtask.description}
        </p>
        <span
          className={`text-label-sm ${subtask.completed ? "text-primary" : "text-on-surface-variant"}`}
        >
          {subtask.completed ? `+${subtask.points} pts earned` : `+${subtask.points} pts`}
        </span>
      </div>

      {!subtask.completed && subtask.expandable && (
        <button
          onClick={() => onExpand(subtask.id)}
          disabled={isExpanding}
          aria-label="Split this step into smaller steps"
          title="Split this step into smaller steps"
          className="shrink-0 h-9 pl-2.5 pr-3 flex items-center gap-1 rounded-full border border-tertiary-fixed text-on-surface-variant hover:bg-surface-container-high hover:text-secondary hover:border-secondary transition-colors disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-[18px] ${isExpanding ? "animate-spin" : ""}`}>
            {isExpanding ? "progress_activity" : "unfold_more"}
          </span>
          <span className="text-label-sm whitespace-nowrap">
            {isExpanding ? "Splitting..." : "Split further"}
          </span>
        </button>
      )}
    </div>
  );
}