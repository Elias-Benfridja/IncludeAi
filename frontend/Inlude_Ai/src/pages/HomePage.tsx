import { useEffect, useState } from "react";
import TopBar from "../components/layout/TopBar";
import BottomNav from "../components/layout/BottomNav";
import TaskCard from "../components/tasks/TaskCard";
import { getTasks, getPointsBalance } from "../api";
import type { Task } from "../types";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [taskList, balance] = await Promise.all([getTasks(), getPointsBalance()]);
        if (!cancelled) {
          setTasks(taskList);
          setPointsBalance(balance);
        }
      } catch {
        if (!cancelled) setError("Couldn't load your tasks — try refreshing.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <TopBar pointsBalance={pointsBalance} />

      <main className="pt-24 pb-32 px-container-margin max-w-200 mx-auto">
        <section className="mb-8">
          <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
            Hello
          </h2>
          <p className="text-body-lg text-on-surface-variant">
            {loading
              ? "Loading your tasks..."
              : tasks.length
              ? `You have ${tasks.length} task${tasks.length === 1 ? "" : "s"} to focus on today. Take your time.`
              : "No tasks yet — start with something small."}
          </p>
        </section>

        {error && <p className="text-label-sm text-error mb-4">{error}</p>}

        <div className="space-y-stack-gap">
          {tasks.map((task, i) => (
            <TaskCard key={task.id} task={task} featured={i === 0} />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
