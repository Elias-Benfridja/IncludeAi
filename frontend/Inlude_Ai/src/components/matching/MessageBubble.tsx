import type { ChatMessage } from "../../types";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isOwn) {
    return (
      <div className="flex flex-col items-end gap-1 max-w-[85%] w-fit self-end ml-auto">
        <div className="bg-secondary-container rounded-2xl rounded-tr-sm p-4 text-on-secondary-container shadow-sm border border-secondary-fixed">
          <p className="text-body-md">{message.content}</p>
        </div>
        <span className="text-label-sm text-on-surface-variant mr-1">{time}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1 max-w-[85%] w-fit self-start mr-auto">
      <div className="bg-surface-container-high rounded-2xl rounded-tl-sm p-4 text-on-surface shadow-sm">
        <p className="text-body-md">{message.content}</p>
      </div>
      <span className="text-label-sm text-on-surface-variant ml-1">{time}</span>
    </div>
  );
}