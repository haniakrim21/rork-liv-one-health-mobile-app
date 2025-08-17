import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

const bookSchema = z.object({
  type: z.enum(["virtual", "inclinic"]),
  date: z.string(),
  time: z.string(),
});

export type BookInput = z.infer<typeof bookSchema>;

const route = publicProcedure
  .input(bookSchema)
  .mutation(async ({ input }) => {
    await new Promise((r) => setTimeout(r, 300));
    return { id: `bk_${Date.now()}`, ...input, status: "confirmed" as const };
  });

export default route;
