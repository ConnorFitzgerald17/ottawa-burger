import { cn } from "@/lib/utils";

export function ScoreSeal({
  score,
  size = "large",
  label = "Spot score",
}: {
  score: number;
  size?: "small" | "large";
  label?: string;
}) {
  const shortLabel = label.replace(/\s+score$/i, "");

  return (
    <div
      className={cn("score-seal", size === "small" && "score-seal--small")}
      aria-label={`${label}: ${score.toFixed(1)} out of 10`}
    >
      <span className="score-seal__label score-seal__label--full" aria-hidden="true">{label}</span>
      <span className="score-seal__label score-seal__label--short" aria-hidden="true">{shortLabel}</span>
      <strong>{score.toFixed(1)}</strong>
      <small>/10</small>
    </div>
  );
}
