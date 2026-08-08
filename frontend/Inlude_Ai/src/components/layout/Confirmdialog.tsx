interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  confirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-on-surface/40 px-container-margin"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-100 bg-surface-container-lowest rounded-xl p-6 shadow-[0_16px_32px_rgba(0,0,0,0.15)] space-y-4"
      >
        <h3 className="text-headline-md text-on-surface">{title}</h3>
        <p className="text-body-md text-on-surface-variant">{message}</p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="h-tap-target-min px-6 bg-error text-on-error rounded-xl text-label-lg transition-all active:scale-95 disabled:opacity-70"
          >
            {confirming ? "Deleting..." : confirmLabel}
          </button>
          <button
            onClick={onCancel}
            disabled={confirming}
            className="h-tap-target-min px-6 border-2 border-tertiary-fixed text-on-surface-variant rounded-xl text-label-lg transition-all active:scale-95"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}