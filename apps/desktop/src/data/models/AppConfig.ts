import { z } from "zod/v4";
import { Phases } from "@/shared/constants.ts";

const PhaseSchema = z.object({
  type: z.enum(Phases),
  allocatedTime: z.number().int().nonnegative(), // in milliseconds
});

export const AppConfigSchema = z.object({
  phases: z.array(PhaseSchema).default([]),
});
