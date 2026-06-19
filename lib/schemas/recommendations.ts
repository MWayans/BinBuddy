import { z } from "zod";
import { DISPOSAL_CATEGORIES, DISPOSAL_METHODS } from "@/lib/types/waste";

export const DisposalRecommendationSchema = z.object({
  intro: z
    .string()
    .describe(
      "Brief friendly 1-2 sentence intro acknowledging the item before recommendations"
    ),
  item: z.string().describe("The name/description of the item identified"),
  material: z.string().describe("Primary material(s) the item is made of"),
  category: z
    .enum(DISPOSAL_CATEGORIES)
    .describe(`Waste category. Must be one of: ${DISPOSAL_CATEGORIES.join(", ")}`),
  disposal_method: z
    .enum(DISPOSAL_METHODS)
    .describe(
      `Recommended disposal method. Must be one of: ${DISPOSAL_METHODS.join(", ")}`
    ),
  disposal_steps: z
    .array(z.string())
    .min(1)
    .describe("Step-by-step instructions for proper disposal"),
  recycling_available: z
    .boolean()
    .describe("Whether recycling options are available for this item"),
  hazards: z
    .array(z.string())
    .optional()
    .describe("Potential hazards or safety concerns"),
  local_notes: z
    .string()
    .describe(
      "Kenya-specific disposal information, locations, or regulations"
    ),
  location_info: z
    .string()
    .optional()
    .describe(
      "Specific locations or facilities in Kenya where this can be disposed"
    ),
  environmental_impact: z
    .string()
    .optional()
    .describe("Brief note on environmental impact"),
});

export type DisposalRecommendation = z.infer<typeof DisposalRecommendationSchema>;
