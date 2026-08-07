import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import ConfirmDialog from "../components/layout/Confirmdialog";
import MessageBubble from "../components/matching/MessageBubble";
import ChatInput from "../components/matching/ChatInput";
import { blockUser, getChatMessages, getChatSession, sendChatMessage, getPointsBalance } from "../api";
import { getCurrentUserId } from "../api/currentUser";
import type { ChatMessage, ChatSession } from "../types";

const POLL_INTERVAL_MS = 3000;

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [expired, setExpired] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmingBlock, setConfirmingBlock] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const currentUserId = getCurrentUserId();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPointsBalance().then(setPointsBalance).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    getChatSession(Number(id))
      .then(setSession)
      .catch(() => {});
  }, [id]);

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

  async function handleBlock() {
    if (!session) return;
    setBlocking(true);
    try {
      await blockUser(session.other_user.id);
      navigate("/chats");
    } catch {
      setBlocking(false);
      setConfirmingBlock(false);
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar pointsBalance={pointsBalance} showBack />

      {session && (
        <div className="fixed top-16 left-0 w-full z-40 bg-surface-container-low border-b border-tertiary-fixed px-container-margin md:px-[20%] lg:px-[30%] h-12 flex items-center justify-between">
          <span className="text-label-lg text-on-surface truncate">
            Chatting with {session.other_user.username}
          </span>
          <button
            onClick={() => setConfirmingBlock(true)}
            className="shrink-0 h-8 px-3 flex items-center gap-1 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">block</span>
            <span className="text-label-sm">Block</span>
          </button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto pt-36 pb-32 px-container-margin md:px-[20%] lg:px-[30%] flex flex-col gap-stack-gap">
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

      <ConfirmDialog
        open={confirmingBlock}
        title="Block this user?"
        message="They won't be able to message you again, and this chat will close immediately. You can't undo this from here."
        confirmLabel="Block"
        confirming={blocking}
        onConfirm={handleBlock}
        onCancel={() => setConfirmingBlock(false)}
      />
    </div>
  );
}