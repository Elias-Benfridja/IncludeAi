import { useNavigate } from "react-router-dom";
import type { Task } from "../../types";

interface TaskCardProps {
  task: Task;
  featured?: boolean;
}

export default function TaskCard({ task, featured = false }: TaskCardProps) {
  const navigate = useNavigate();
  const total = task.totalCount ?? task.subtasks.length;
  const completed = task.completedCount ?? task.subtasks.filter((s) => s.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <button
      onClick={() => navigate(`/tasks/${task.id}`)}
      className={`w-full text-left bg-surface-container-lowest border border-tertiary-fixed rounded-xl shadow-[0_16px_32px_rgba(0,0,0,0.04)] transition-all active:scale-[0.99] ${
        featured ? "p-8" : "p-6"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className={featured ? "text-headline-md text-on-surface" : "text-body-lg font-semibold text-on-surface"}>
          {task.description}
        </h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end text-label-lg text-on-surface-variant">
          <span>
            {completed} of {total} steps done
          </span>
          <span className="text-primary">{percent}%</span>
        </div>
        <div className={`w-full bg-surface-variant rounded-full overflow-hidden ${featured ? "h-4" : "h-2"}`}>
          <div
            className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </button>
  );
}
