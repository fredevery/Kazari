import { z } from "zod/v4";
import Store from "electron-store";
import { BaseStore } from "./BaseStore.ts";

export class ScheduleStore extends BaseStore {
  private schema = z.object({
    slots: z.array(
      z.object({
        id: z.string(),
      }),
    ),
  });
  private store: Store<z.infer<typeof this.schema>>;

  constructor() {
    super();
    this.store = new Store<z.infer<typeof this.schema>>({});
  }
}
