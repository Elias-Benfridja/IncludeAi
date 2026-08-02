import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import BottomNav from "../components/layout/BottomNav";
import TemplateChip from "../components/rewards/TemplateChip";
import { createReward, getPointsBalance } from "../api";

interface Template {
  emoji: string;
  name: string;
  price: number;
}

const TEMPLATES: Template[] = [
  { emoji: "☕️", name: "Quick Break", price: 15 },
  { emoji: "📱", name: "Screen Time", price: 30 },
  { emoji: "🍦", name: "Sweet Treat", price: 50 },
  { emoji: "🎮", name: "Gaming Session", price: 60 },
];

export default function RewardFormPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState(20);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pointsBalance, setPointsBalance] = useState(0);

  useEffect(() => {
    getPointsBalance().then(setPointsBalance).catch(() => {});
  }, []);

  function applyTemplate(template: Template) {
    setSelectedTemplate(template.name);
    setName(template.name);
    setPrice(template.price);
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("Give your reward a name first.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await createReward({ name: name.trim(), price });
      navigate("/rewards");
    } catch {
      setError("Couldn't save this reward — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar pointsBalance={pointsBalance} showBack />

      <main className="pt-24 pb-32 px-container-margin max-w-150 mx-auto space-y-stack-gap">
        <h2 className="text-headline-md text-on-surface">New reward</h2>

        <section className="space-y-3">
          <p className="text-label-lg text-on-surface-variant">Start with a template</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TEMPLATES.map((template) => (
              <TemplateChip
                key={template.name}
                template={template}
                selected={selectedTemplate === template.name}
                onSelect={() => applyTemplate(template)}
              />
            ))}
          </div>
        </section>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-tertiary-fixed shadow-[0_16px_32px_rgba(0,0,0,0.04)] flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="reward-name" className="text-label-lg text-on-surface-variant">
              Reward name
            </label>
            <input
              id="reward-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSelectedTemplate(null);
              }}
              placeholder="E.g. Afternoon nap"
              className="h-tap-target-min px-4 rounded-lg bg-surface border-2 border-tertiary-fixed text-body-md focus:outline-none focus:border-secondary transition-all"
            />
            {error && <p className="text-label-sm text-error">{error}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="reward-cost" className="text-label-lg text-on-surface-variant">
              Point cost
            </label>
            <div className="relative flex items-center">
              <input
                id="reward-cost"
                type="number"
                min={1}
                value={price}
                onChange={(e) => {
                  setPrice(Number(e.target.value));
                  setSelectedTemplate(null);
                }}
                className="h-tap-target-min w-full pl-4 pr-12 rounded-lg bg-surface border-2 border-tertiary-fixed text-body-md focus:outline-none focus:border-secondary transition-all"
              />
              <span className="absolute right-4 text-label-lg text-on-surface-variant">PTS</span>
            </div>
            {/* Once the AI cost-suggestion endpoint exists, show its recommendation here. */}
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-tap-target-min w-full bg-secondary text-white text-label-lg rounded-full shadow-sm active:scale-95 transition-all disabled:opacity-70"
            >
              {saving ? "Saving..." : "Create reward"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="h-tap-target-min w-full border-2 border-secondary text-secondary text-label-lg rounded-full hover:bg-secondary-fixed transition-all"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-primary-fixed bg-opacity-30 rounded-xl border border-primary-container">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            info
          </span>
          <p className="text-body-md text-on-primary-container">
            Small, frequent rewards help maintain momentum without burnout.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
