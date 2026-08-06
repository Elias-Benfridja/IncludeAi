import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import MessageBubble from "../components/matching/MessageBubble";
import ChatInput from "../components/matching/ChatInput";
import { getChatMessages, sendChatMessage, getPointsBalance } from "../api";
import { getCurrentUserId } from "../api/currentUser";
import type { ChatMessage } from "../types";

const POLL_INTERVAL_MS = 3000;

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [expired, setExpired] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const currentUserId = getCurrentUserId();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPointsBalance().then(setPointsBalance).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id || expired) return;

    let cancelled = false;

    async function poll() {
      try {
        const data = await getChatMessages(Number(id));
        if (!cancelled) setMessages(data);
      } catch (err: any) {
        if (!cancelled && err?.response?.status === 410) {
          setExpired(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id, expired]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(content: string) {
    if (!id) return;
    setSending(true);
    try {
      const message = await sendChatMessage(Number(id), content);
      setMessages((prev) => [...prev, message]);
    } catch (err: any) {
      if (err?.response?.status === 410) {
        setExpired(true);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar pointsBalance={pointsBalance} showBack />

      <main className="flex-1 overflow-y-auto pt-24 pb-32 px-container-margin md:px-[20%] lg:px-[30%] flex flex-col gap-stack-gap">
        {!expired && (
          <div className="flex justify-center w-full mb-2">
            <div className="bg-surface-container-low px-4 py-2 rounded-full border border-surface-variant">
              <span className="text-label-sm text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                Active — closes after 60 min of inactivity
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-body-md text-on-surface-variant text-center">Loading...</p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </main>

      <ChatInput expired={expired} sending={sending} onSend={handleSend} />
    </div>
  );
}