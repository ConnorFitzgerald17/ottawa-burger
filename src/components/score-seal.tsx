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
  return (
    <div
      className={cn("score-seal", size === "small" && "score-seal--small")}
      aria-label={`${label}: ${score.toFixed(1)} out of 10`}
    >
      <span>{label}</span>
      <strong>{score.toFixed(1)}</strong>
      <small>/10</small>
    </div>
  );
}
