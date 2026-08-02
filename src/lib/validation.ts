import { z } from "zod";
import { ratingCategories } from "@/lib/types";

const optionalUrl = z.union([z.url(), z.literal("")]).optional();
const databaseUuid = z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  "Invalid database ID",
);

export const venueSchema = z.object({
  id: databaseUuid.optional(),
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().min(5).max(240),
  neighbourhood: z.string().trim().min(2).max(80),
  websiteUrl: optionalUrl,
  phone: z.string().trim().max(40).optional(),
  isClosed: z.boolean().optional(),
});

export const ratingSchema = z.object({
  reviewerId: databaseUuid,
  category: z.enum(ratingCategories),
  score: z
    .number()
    .min(0)
    .max(10)
    .refine(
      (value) => Math.abs(value * 10 - Math.round(value * 10)) < 1e-9,
      "Use no more than one decimal place",
    ),
});

const whiskeySourScoreSchema = z
  .number()
  .min(0)
  .max(10)
  .refine(
    (value) => Math.abs(value * 10 - Math.round(value * 10)) < 1e-9,
    "Use no more than one decimal place",
  );

function validateWhiskeySourPair(
  details: { whiskeySourScore?: number; whiskeySourNotes?: string },
  context: z.RefinementCtx,
) {
  const hasScore = details.whiskeySourScore !== undefined;
  const hasNotes = Boolean(details.whiskeySourNotes?.trim());
  if (hasScore === hasNotes) return;

  context.addIssue({
    code: "custom",
    path: hasScore ? ["whiskeySourNotes"] : ["whiskeySourScore"],
    message: "Add both the whiskey sour score and tasting notes, or leave both blank",
  });
}

export const whiskeySourDetailsSchema = z
  .object({
    whiskeySourScore: whiskeySourScoreSchema.optional(),
    whiskeySourNotes: z.string().trim().min(10).max(1000).optional(),
  })
  .superRefine(validateWhiskeySourPair);

export const reviewSchema = z.object({
  id: databaseUuid.optional(),
  venue: venueSchema,
  visitDate: z.iso.date(),
  summary: z.string().trim().min(20).max(240),
  story: z.string().trim().min(40).max(12000),
  verdict: z.string().trim().min(10).max(1000),
  burgerOrder: z.string().trim().min(2).max(160),
  friesOrder: z.string().trim().max(160).optional(),
  beerOrder: z.string().trim().max(160).optional(),
  whiskeySourScore: whiskeySourScoreSchema.optional(),
  whiskeySourNotes: z.string().trim().min(10).max(1000).optional(),
  burgerPrice: z.number().min(0).max(500).optional(),
  baselineType: z.enum(["original", "closest", "exception"]),
  baselineNote: z.string().trim().min(5).max(500),
  ratings: z.array(ratingSchema),
  takes: z.array(
    z.object({
      reviewerId: databaseUuid,
      body: z.string().trim().min(10).max(800),
    }),
  ),
}).superRefine(validateWhiskeySourPair);

export type ReviewInput = z.infer<typeof reviewSchema>;
