import { ScoreSeal } from "@/components/score-seal";

export function WhiskeySourReport({ score, notes }: { score: number; notes: string }) {
  return (
    <section className="section whiskey-sour-section" aria-labelledby="whiskey-sour-heading">
      <div className="shell whiskey-sour-report">
        <div className="whiskey-sour-report__heading">
          <p className="eyebrow">Off the scorecard</p>
          <h2 id="whiskey-sour-heading">The whiskey sour report.</h2>
          <span className="whiskey-sour-report__disclaimer">Not included in the Spot score</span>
        </div>
        <ScoreSeal score={score} label="Sour score" />
        <p className="whiskey-sour-report__notes">{notes}</p>
      </div>
    </section>
  );
}
