import { useState, type FormEvent } from "react";

interface ChatInputProps {
  expired: boolean;
  sending: boolean;
  onSend: (content: string) => void;
}

export default function ChatInput({ expired, sending, onSend }: ChatInputProps) {
  const [content, setContent] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    onSend(trimmed);
    setContent("");
  }

  if (expired) {
    return (
      <div className="fixed bottom-0 w-full bg-surface border-t border-surface-variant px-container-margin py-6 md:px-[20%] lg:px-[30%] z-40 pb-safe flex justify-center items-center">
        <div className="bg-surface-container px-6 py-4 rounded-xl text-center border border-outline-variant max-w-md w-full">
          <span className="material-symbols-outlined text-on-surface-variant mb-2 block">lock</span>
          <p className="text-body-md text-on-surface-variant">
            This chat has closed. Start a new one from a similar task.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-0 w-full bg-surface border-t border-surface-variant px-container-margin py-4 md:px-[20%] lg:px-[30%] z-40 pb-safe"
    >
      <div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-full p-2 pr-4 shadow-sm focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary transition-all">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-body-md text-on-surface placeholder:text-on-surface-variant px-2"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          aria-label="Send message"
          className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded-full transition-transform active:scale-95 shadow-sm disabled:opacity-50"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            send
          </span>
        </button>
      </div>
    </form>
  );
}