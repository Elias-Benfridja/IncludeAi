import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import BottomNav from "../components/layout/BottomNav";
import MatchCard from "../components/matching/MatchCard";
import MatchingToggle from "../components/matching/MatchingToggle";
import {
  getSimilarTasks,
  getPointsBalance,
  getMatchingPreference,
  setMatchingPreference,
  createChatSession,
} from "../api";
import type { TaskMatch } from "../types";

export default function SimilarTasksPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<TaskMatch[]>([]);
  const [matchingEnabled, setMatchingEnabledState] = useState(false);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectingId, setConnectingId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      try {
        const enabled = await getMatchingPreference();
        if (cancelled) return;
        setMatchingEnabledState(enabled);

        const balance = await getPointsBalance();
        if (cancelled) return;
        setPointsBalance(balance);

        if (enabled) {
          const results = await getSimilarTasks(Number(id));
          if (!cancelled) setMatches(results);
        }
      } catch {
        if (!cancelled) setError("Couldn't load matches — try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleToggle(enabled: boolean) {
    setMatchingEnabledState(enabled);
    try {
      await setMatchingPreference(enabled);
      if (enabled && id) {
        const results = await getSimilarTasks(Number(id));
        setMatches(results);
      } else {
        setMatches([]);
      }
    } catch {
      setError("Couldn't update your matching preference — try again.");
    }
  }

  async function handleChat(match: TaskMatch) {
    if (!id) return;
    setConnectingId(match.task_id);
    try {
      const session = await createChatSession(match.user_id, Number(id), match.task_id);
      navigate(`/chat/${session.id}`);
    } catch {
      setError("Couldn't start that chat — try again.");
    } finally {
      setConnectingId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar pointsBalance={pointsBalance} showBack />

      <main className="pt-24 pb-32 px-container-margin max-w-200 mx-auto flex flex-col gap-stack-gap">
        <MatchingToggle enabled={matchingEnabled} onToggle={handleToggle} />

        {error && <p className="text-label-sm text-error">{error}</p>}

        {loading ? (
          <p className="text-body-md text-on-surface-variant">Loading...</p>
        ) : !matchingEnabled ? null : matches.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">
            No one else is working on something similar right now.
          </p>
        ) : (
          <section className="flex flex-col gap-stack-gap">
            {matches.map((match) => (
              <MatchCard
                key={match.task_id}
                match={match}
                onChat={handleChat}
              />
            ))}
          </section>
        )}
        {connectingId !== null && (
          <p className="text-label-sm text-on-surface-variant text-center">Connecting...</p>
        )}
      </main>

      <BottomNav />
    </div>
  );
}