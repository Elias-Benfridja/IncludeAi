import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getChatNotifications } from "../../api";

const POLL_INTERVAL_MS = 5000;
const TOAST_LIFETIME_MS = 6000;

interface Toast {
  id: string;
  sessionId: number;
  username: string;
  kind: "request" | "message";
}

export default function NotificationCenter() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location.pathname);
  const knownUnread = useRef<Map<number, number>>(new Map());
  const shownRequests = useRef<Set<number>>(new Set());
  const firstPoll = useRef(true);

  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (!localStorage.getItem("access_token")) return;
      try {
        const sessions = await getChatNotifications();
        if (cancelled) return;

        const newToasts: Toast[] = [];

        for (const session of sessions) {
          const onThisChat = locationRef.current === `/chat/${session.id}`;

          if (session.is_new_request && !shownRequests.current.has(session.id) && !onThisChat) {
            shownRequests.current.add(session.id);
            newToasts.push({
              id: `request-${session.id}-${Date.now()}`,
              sessionId: session.id,
              username: session.other_user.username,
              kind: "request",
            });
          }

          const previousUnread = knownUnread.current.get(session.id) ?? 0;
          if (!firstPoll.current && session.unread_count > previousUnread && !onThisChat) {
            newToasts.push({
              id: `message-${session.id}-${Date.now()}`,
              sessionId: session.id,
              username: session.other_user.username,
              kind: "message",
            });
          }
          knownUnread.current.set(session.id, session.unread_count);
        }

        firstPoll.current = false;

        if (newToasts.length) {
          setToasts((prev) => [...prev, ...newToasts]);
          newToasts.forEach((toast) => {
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== toast.id));
            }, TOAST_LIFETIME_MS);
          });
        }
      } catch {
        // Silently ignore — this is a background poller, not a page load.
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function openChat(toast: Toast) {
    dismiss(toast.id);
    navigate(`/chat/${toast.sessionId}`);
  }

  if (!toasts.length) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-100 flex flex-col gap-3 w-[calc(100%-2*var(--spacing-container-margin))] max-w-110 px-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className="bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-4 shadow-[0_16px_32px_rgba(0,0,0,0.12)] flex items-center gap-3 animate-in"
        >
          <span
            className="material-symbols-outlined text-primary text-[24px] shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {toast.kind === "request" ? "waving_hand" : "chat_bubble"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-body-md text-on-surface">
              {toast.kind === "request"
                ? `${toast.username} wants to talk with you`
                : `New message from ${toast.username}`}
            </p>
          </div>
          <button
            onClick={() => openChat(toast)}
            className="shrink-0 h-9 px-4 bg-secondary text-on-secondary text-label-sm rounded-full transition-all active:scale-95"
          >
            Open chat
          </button>
          <button
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss"
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}