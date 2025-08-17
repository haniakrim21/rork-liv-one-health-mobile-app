import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

const historySchema = z.object({
  smoking: z.string().trim().min(1, "Required"),
  alcohol: z.string().trim().min(1, "Required"),
  conditions: z.string().trim().min(1, "Required"),
  meds: z.string().trim().min(1, "Required"),
  allergies: z.string().trim().min(1, "Required"),
});

export type HistoryInput = z.infer<typeof historySchema>;

const store: { latest?: HistoryInput } = {};

const route = publicProcedure
  .input(historySchema)
  .mutation(async ({ input }) => {
    await new Promise((r) => setTimeout(r, 200));
    store.latest = input;
    return { ok: true as const, savedAt: new Date().toISOString(), data: input };
  });

export default route;
export { store as historyStore };
