import type { TaskMatch } from "../../types";

interface MatchCardProps {
  match: TaskMatch;
  onChat: (match: TaskMatch) => void;
}

export default function MatchCard({ match, onChat }: MatchCardProps) {
  const initial = match.username.charAt(0).toUpperCase();

  return (
    <article className="bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-6 shadow-[0_16px_32px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container text-headline-md shrink-0">
          {initial}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-label-lg text-on-surface">{match.username}</span>
          <span className="text-body-md text-on-surface-variant">{match.description}</span>
        </div>
      </div>
      <button
        onClick={() => onChat(match)}
        className="min-h-[48px] px-6 py-2 border-2 border-secondary text-secondary text-label-lg rounded-full hover:bg-surface-container-low transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined">chat</span>
        Chat
      </button>
    </article>
  );
}