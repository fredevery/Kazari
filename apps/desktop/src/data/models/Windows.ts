import { z } from "zod/v4";
import { WindowType } from "@/shared/constants.js";

export const WindowStateSchema = z.object({
  bounds: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  isMaximized: z.boolean(),
  isFullScreen: z.boolean(),
  isVisible: z.boolean(),
});

export const WindowConfigSchema = z.object({
  id: z.string(), //z.uuid({ version: "v4" }),
  type: z.enum(WindowType),
  state: WindowStateSchema,
});
