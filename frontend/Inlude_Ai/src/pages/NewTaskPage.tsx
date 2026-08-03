import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import BottomNav from "../components/layout/BottomNav";
import { createTask, getPointsBalance } from "../api";

export default function NewTaskPage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [pointsBalance, setPointsBalance] = useState(0);
  const [fieldError, setFieldError] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getPointsBalance().then(setPointsBalance).catch(() => {});
  }, []);

  async function handleBreakdown() {
    if (!description.trim()) {
      setFieldError(true);
      return;
    }
    setFieldError(false);
    setSubmitError("");
    setSubmitting(true);
    try {
      const task = await createTask(description.trim());
      navigate(`/tasks/${task.id}`);
    } catch {
      setSubmitError("Couldn't break this down right now — try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar pointsBalance={pointsBalance} />

      <main className="pt-24 pb-32 min-h-screen flex flex-col items-center justify-center px-container-margin max-w-200 mx-auto">
        <div className="w-full mb-10 text-center">
          <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
            Capture your thought.
          </h2>
          <p className="text-on-surface-variant text-body-lg">
            Let's turn that overwhelm into a plan.
          </p>
        </div>

        <div className="w-full space-y-stack-gap">
          <div>
            <label htmlFor="task-input" className="block text-label-lg text-on-surface-variant mb-2 ml-2">
              What do you want to accomplish?
            </label>
            <textarea
              id="task-input"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Clean the kitchen and organize the pantry items..."
              className={`w-full p-6 rounded-xl border-2 bg-surface-container-lowest text-on-surface text-body-lg placeholder:text-surface-dim focus:outline-none transition-all resize-none ${
                fieldError ? "border-error" : "border-tertiary-fixed focus:border-secondary"
              }`}
            />
          </div>

          {submitError && <p className="text-label-sm text-error text-center">{submitError}</p>}

          <div className="flex flex-col items-center gap-4 pt-4">
            <button
              onClick={handleBreakdown}
              disabled={submitting}
              className="h-14 px-12 bg-secondary text-on-secondary text-headline-md rounded-full shadow-lg transition-transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <span
                className={`material-symbols-outlined ${submitting ? "animate-spin" : ""}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {submitting ? "progress_activity" : "auto_awesome"}
              </span>
              <span>{submitting ? "Breaking it down..." : "Break it down"}</span>
            </button>
            <p className="text-label-sm text-outline flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Our AI will split this into manageable mini-steps.
            </p>
            <p className="text-label-sm text-outline flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">tips_and_updates</span>
              The more detail you give, the better the breakdown — e.g. "5-paragraph essay on..." works better than "English homework."
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}