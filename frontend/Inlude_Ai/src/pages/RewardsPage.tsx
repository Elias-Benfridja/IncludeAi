import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import BottomNav from "../components/layout/BottomNav";
import RewardCard from "../components/rewards/RewardCard";
import { getRewards, getPointsBalance, redeemReward } from "../api";
import type { Reward } from "../types";

export default function RewardsPage() {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [rewardList, balance] = await Promise.all([getRewards(), getPointsBalance()]);
        if (!cancelled) {
          setRewards(rewardList);
          setPointsBalance(balance);
        }
      } catch {
        if (!cancelled) setError("Couldn't load your rewards — try refreshing.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRedeem(rewardId: number) {
    try {
      const { balance } = await redeemReward(rewardId);
      setPointsBalance(balance);
    } catch {
      setError("Couldn't redeem that reward — try again.");
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar pointsBalance={pointsBalance} />

      <main className="pt-24 pb-32 px-container-margin max-w-200 mx-auto">
        <section className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-headline-lg text-on-surface mb-2">Your rewards</h2>
            <p className="text-body-md text-on-surface-variant">
              Redeem your points for moments of joy and rest.
            </p>
          </div>
          <button
            onClick={() => navigate("/rewards/new")}
            aria-label="Add a new reward"
            className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-secondary text-on-secondary shadow-sm active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </section>

        {error && <p className="text-label-sm text-error mb-4">{error}</p>}

        {!loading && rewards.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">
            You haven't added any rewards yet — tap + to set one up.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-gap">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                pointsBalance={pointsBalance}
                onRedeem={handleRedeem}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
