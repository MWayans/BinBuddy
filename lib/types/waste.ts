/**
 * Canonical waste and disposal taxonomies used across prompts, schemas, and UI.
 */

export const DISPOSAL_CATEGORIES = [
  "Plastic",
  "Paper",
  "Metal",
  "Glass",
  "Cardboard",
  "Electronic",
  "Organic",
  "Hazardous",
  "General Waste",
] as const;

export type DisposalCategory = (typeof DISPOSAL_CATEGORIES)[number];

export const DISPOSAL_METHODS = [
  "Recycle",
  "Compost",
  "Landfill",
  "Special Collection",
  "Reuse",
] as const;

export type DisposalMethod = (typeof DISPOSAL_METHODS)[number];
