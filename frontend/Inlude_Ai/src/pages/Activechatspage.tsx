import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import BottomNav from "../components/layout/BottomNav";
import { getChatSessions, getPointsBalance } from "../api";
import type { ChatSession } from "../types";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

export default function ActiveChatsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [sessionList, balance] = await Promise.all([getChatSessions(), getPointsBalance()]);
        if (!cancelled) {
          setSessions(sessionList);
          setPointsBalance(balance);
        }
      } catch {
        if (!cancelled) setError("Couldn't load your chats — try refreshing.");
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
      <TopBar pointsBalance={pointsBalance} showBack />

      <main className="pt-24 pb-32 px-container-margin max-w-200 mx-auto">
        <section className="mb-8">
          <h2 className="text-headline-lg text-on-surface mb-2">Active chats</h2>
          <p className="text-body-md text-on-surface-variant">
            Conversations close automatically after 60 minutes of inactivity.
          </p>
        </section>

        {error && <p className="text-label-sm text-error mb-4">{error}</p>}

        {loading ? (
          <p className="text-body-md text-on-surface-variant">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">
            No active chats right now — find someone working on a similar task to start one.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => navigate(`/chat/${session.id}`)}
                className="w-full text-left bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-5 shadow-[0_16px_32px_rgba(0,0,0,0.04)] transition-all active:scale-[0.99] flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container text-headline-md shrink-0">
                  {session.other_user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-label-lg text-on-surface truncate">
                    {session.other_user.username}
                  </p>
                  <p className="text-label-sm text-on-surface-variant">
                    {formatRelativeTime(session.last_activity_at)}
                  </p>
                </div>
                {(session.unread_count > 0 || session.is_new_request) && (
                  <span className="shrink-0 min-w-[24px] h-6 px-2 flex items-center justify-center rounded-full bg-primary text-on-primary text-label-sm">
                    {session.is_new_request ? "New" : session.unread_count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}