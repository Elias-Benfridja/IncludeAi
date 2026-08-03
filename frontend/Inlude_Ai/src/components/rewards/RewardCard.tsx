import { useState } from "react";
import type { Reward } from "../../types";
import ConfirmDialog from "../layout/Confirmdialog";

interface RewardCardProps {
  reward: Reward;
  pointsBalance: number;
  onRedeem: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function RewardCard({ reward, pointsBalance, onRedeem, onDelete }: RewardCardProps) {
  const canAfford = pointsBalance >= reward.price;
  const percent = Math.min(100, Math.round((pointsBalance / reward.price) * 100));
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function handleConfirmDelete() {
    setConfirmingDelete(false);
    onDelete(reward.id);
  }

  return (
    <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-6 shadow-[0_16px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className="w-14 h-14 bg-secondary-fixed rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary text-[28px]">redeem</span>
        </div>
        <div className="flex items-start gap-2">
          <div className="text-right">
            <span className="block text-label-sm text-on-surface-variant uppercase tracking-wider">
              Cost
            </span>
            <span className={`text-headline-md ${canAfford ? "text-secondary" : "text-on-surface-variant"}`}>
              {reward.price} pts
            </span>
          </div>
          <button
            onClick={() => setConfirmingDelete(true)}
            aria-label="Delete this reward"
            title="Delete this reward"
            className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete reward"
        message={`Delete "${reward.name}"? This can't be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />

      <h3 className="text-headline-md text-on-surface mb-6">{reward.name}</h3>

      <div className="space-y-3">
        <div className="flex justify-between text-label-lg text-on-surface-variant">
          <span>Progress</span>
          <span>
            {canAfford ? "Ready to redeem" : `${pointsBalance} of ${reward.price} pts`}
          </span>
        </div>
        <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
        <button
          onClick={() => onRedeem(reward.id)}
          disabled={!canAfford}
          className={`w-full h-tap-target-min rounded-xl text-label-lg transition-all active:scale-95 ${
            canAfford
              ? "bg-secondary text-white shadow-sm"
              : "bg-surface-container-high text-on-surface-variant cursor-not-allowed"
          }`}
        >
          {canAfford ? "Redeem reward" : `Need ${reward.price - pointsBalance} more pts`}
        </button>
      </div>
    </div>
  );
}