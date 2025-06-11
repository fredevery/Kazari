import { z } from "zod/v4";
import { Phases } from "@/shared/enums.js";

export const PhaseSchema = z.object({
  type: z.enum(Phases),
  allocatedTime: z.number().int().nonnegative(), // in milliseconds
});
export type PhaseType = z.infer<typeof PhaseSchema>;
