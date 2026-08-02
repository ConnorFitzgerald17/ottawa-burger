import Image from "next/image";
import { categoryLabels, type ReviewerScorecard } from "@/lib/types";

export function Scorecard({ scorecard }: { scorecard: ReviewerScorecard }) {
  const { reviewer } = scorecard;
  return (
    <article className="scorecard">
      <div className="scorecard__head">
        <div>
          <p className="eyebrow">Main reviewer&apos;s card</p>
          <h3>{reviewer.displayName}</h3>
        </div>
        <div className="reviewer-avatar">
          {reviewer.avatarUrl ? (
            <Image src={reviewer.avatarUrl} alt="" width={62} height={62} />
          ) : (
            reviewer.displayName.charAt(0)
          )}
        </div>
      </div>
      <ul className="score-list">
        {scorecard.scores.map(({ category, score }) => (
          <li key={category}>
            <span>{categoryLabels[category]}</span>
            <strong>{score.toFixed(1)}</strong>
          </li>
        ))}
      </ul>
      <div className="scorecard__total">
        <span className="field-label">Weighted score</span>
        <strong>{scorecard.weightedScore.toFixed(1)}</strong>
      </div>
      <blockquote>“{scorecard.take}”</blockquote>
    </article>
  );
}
