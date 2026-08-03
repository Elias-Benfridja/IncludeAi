import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import BottomNav from "../components/layout/BottomNav";
import SubtaskItem from "../components/tasks/SubtaskItem";
import { getTask, getPointsBalance, completeSubtask, deleteTask, expandSubtask } from "../api";
import type { Task } from "../types";

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expandingId, setExpandingId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      try {
        const [taskData, balance] = await Promise.all([getTask(id as string), getPointsBalance()]);
        if (!cancelled) {
          setTask(taskData);
          setPointsBalance(balance);
        }
      } catch {
        if (!cancelled) setError("Couldn't load this task.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleCompleteSubtask(subtaskId: number) {
    try {
      const { points_balance } = await completeSubtask(subtaskId);
      setTask((prev) =>
        prev
          ? {
              ...prev,
              subtasks: prev.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, completed: true } : s
              ),
            }
          : prev
      );
      setPointsBalance(points_balance);
    } catch {
      setError("Couldn't mark that step complete — try again.");
    }
  }

  async function handleExpandSubtask(subtaskId: number) {
    setExpandingId(subtaskId);
    try {
      const updatedTask = await expandSubtask(subtaskId);
      setTask(updatedTask);
    } catch {
      setError("Couldn't break that step down further — try again.");
    } finally {
      setExpandingId(null);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteTask(id);
      navigate("/");
    } catch {
      setError("Couldn't delete this task — try again.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopBar pointsBalance={pointsBalance} showBack />
        <main className="pt-24 px-container-margin max-w-200 mx-auto">
          <p className="text-body-md text-on-surface-variant">Loading...</p>
        </main>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="min-h-screen">
        <TopBar pointsBalance={pointsBalance} showBack />
        <main className="pt-24 px-container-margin max-w-200 mx-auto">
          <p className="text-label-sm text-error">{error}</p>
        </main>
      </div>
    );
  }

  if (!task) return null;

  const completedCount = task.subtasks.filter((s) => s.completed).length;
  const percent = task.subtasks.length
    ? Math.round((completedCount / task.subtasks.length) * 100)
    : 0;
  const currentId = task.subtasks.find((s) => !s.completed)?.id;

  return (
    <div className="min-h-screen">
      <TopBar pointsBalance={pointsBalance} showBack />

      <main className="pt-24 pb-32 px-container-margin max-w-200 mx-auto">
        <section className="mb-8">
          <h2 className="text-headline-lg-mobile text-on-surface mb-2">{task.description}</h2>
          <p className="text-label-sm text-on-surface-variant mb-3">
            {completedCount} of {task.subtasks.length} steps completed
          </p>
          <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </section>

        {error && <p className="text-label-sm text-error mb-4">{error}</p>}

        <section className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-headline-md text-on-surface">Subtasks</h3>
            <span className="text-label-sm text-on-surface-variant italic">AI-generated</span>
          </div>

          {task.subtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              isCurrent={subtask.id === currentId}
              isExpanding={expandingId === subtask.id}
              onComplete={handleCompleteSubtask}
              onExpand={handleExpandSubtask}
            />
          ))}
        </section>

        <section className="mt-10 pt-6 border-t border-tertiary-fixed">
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="text-label-lg text-on-surface-variant hover:text-error transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
              Delete this task
            </button>
          ) : (
            <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-6 space-y-4">
              <p className="text-body-md text-on-surface">
                Delete "{task.description}" and all its steps? This can't be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-tap-target-min px-6 bg-error text-on-error rounded-xl text-label-lg transition-all active:scale-95 disabled:opacity-70"
                >
                  {deleting ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  className="h-tap-target-min px-6 border-2 border-tertiary-fixed text-on-surface-variant rounded-xl text-label-lg transition-all active:scale-95"
                >
                  Keep it
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}