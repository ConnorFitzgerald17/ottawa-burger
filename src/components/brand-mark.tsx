import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function BrandMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={cn("brand-mark", className)}
      viewBox="0 0 100 118"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M50 115C50 115 91 77.4 91 43.5C91 20.6 72.6 2 50 2S9 20.6 9 43.5C9 77.4 50 115 50 115Z"
        fill="currentColor"
        stroke="var(--ink)"
        strokeWidth="4"
      />
      <path d="M25 45h50" stroke="var(--paper)" strokeWidth="7" strokeLinecap="round" />
      <path
        d="M29 37c1.5-11 10-17 21-17s19.5 6 21 17H29Z"
        fill="var(--mustard)"
        stroke="var(--ink)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="41" cy="28" r="1.5" fill="var(--ink)" />
      <circle cx="52" cy="25" r="1.5" fill="var(--ink)" />
      <circle cx="61" cy="30" r="1.5" fill="var(--ink)" />
      <path
        d="M29 54h42c0 9-6 15-16 15H45c-10 0-16-6-16-15Z"
        fill="var(--bun)"
        stroke="var(--ink)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="m31 48 10 6 10-6 10 6 9-6" stroke="var(--pickle)" strokeWidth="5" />
    </svg>
  );
}
