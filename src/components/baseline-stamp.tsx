import type { BaselineType } from "@/lib/types";

const labels: Record<BaselineType, { top: string; main: string }> = {
  original: { top: "Baseline test", main: "House original" },
  closest: { top: "Baseline test", main: "Closest classic" },
  exception: { top: "Baseline note", main: "House exception" },
};

export function BaselineStamp({ type }: { type: BaselineType }) {
  const label = labels[type];
  return (
    <span className={`baseline-stamp baseline-stamp--${type}`}>
      <span>{label.top}</span>
      <strong>{label.main}</strong>
    </span>
  );
}
