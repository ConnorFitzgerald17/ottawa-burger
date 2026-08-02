import { cn } from "@/lib/utils";

export function LoopingMarquee({
  items,
  tone = "mustard",
}: {
  items: string[];
  tone?: "mustard" | "tomato";
}) {
  return (
    <div className={cn("marquee", tone === "tomato" && "marquee--tomato")} aria-hidden="true">
      <div className="marquee__track">
        {[0, 1].map((group) => (
          <div className="marquee__group" key={group}>
            {items.map((item) => (
              <span key={`${group}-${item}`}>{item}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
