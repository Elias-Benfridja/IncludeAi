import { useEffect, useState } from "react";
import type { Task } from "../../types";

interface TaskTimerProps {
  task: Task;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  busy: boolean;
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/**
 * Computes the current display value from the task's stored fields:
 * the banked total, plus (if running) however long it's been since it started.
 */
function computeDisplaySeconds(task: Task): number {
  if (!task.timer_started_at) return task.timer_elapsed_seconds;
  const startedAt = new Date(task.timer_started_at).getTime();
  const elapsedSinceStart = Math.floor((Date.now() - startedAt) / 1000);
  return task.timer_elapsed_seconds + elapsedSinceStart;
}

export default function TaskTimer({ task, onStart, onPause, onStop, busy }: TaskTimerProps) {
  const [displaySeconds, setDisplaySeconds] = useState(() => computeDisplaySeconds(task));

  const isRunning = task.timer_started_at !== null;

  // Re-anchor the display whenever the task itself changes (start/pause/stop
  // all return a fresh task, so the anchor point needs to be recalculated).
  useEffect(() => {
    setDisplaySeconds(computeDisplaySeconds(task));
  }, [task]);

  // Local ticking — purely cosmetic, never touches the API. Only runs while
  // the timer is actually running server-side.
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setDisplaySeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-6 shadow-[0_16px_32px_rgba(0,0,0,0.04)] flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-[28px]">
          {isRunning ? "timer" : "timer_pause"}
        </span>
        <div>
          <p className="text-headline-md text-on-surface tabular-nums">
            {formatDuration(displaySeconds)}
          </p>
          <p className="text-label-sm text-on-surface-variant">
            {task.timer_stopped ? "Timer stopped" : isRunning ? "Running" : "Paused"}
          </p>
        </div>
      </div>

      {task.timer_stopped ? (
        <div className="flex gap-2">
          <button
            onClick={onStart}
            disabled={busy}
            className="h-tap-target-min px-5 bg-secondary text-on-secondary text-label-lg rounded-full transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">replay</span>
            Restart
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          {isRunning ? (
            <button
              onClick={onPause}
              disabled={busy}
              className="h-tap-target-min px-5 border-2 border-secondary text-secondary text-label-lg rounded-full hover:bg-surface-container-low transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">pause</span>
              Pause
            </button>
          ) : (
            <button
              onClick={onStart}
              disabled={busy}
              className="h-tap-target-min px-5 bg-secondary text-on-secondary text-label-lg rounded-full transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">play_arrow</span>
              Start
            </button>
          )}
          <button
            onClick={onStop}
            disabled={busy}
            aria-label="Stop timer"
            title="Stop timer"
            className="h-tap-target-min w-tap-target-min flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">stop</span>
          </button>
        </div>
      )}
    </div>
  );
}