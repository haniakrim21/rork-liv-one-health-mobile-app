import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

const availabilitySchema = z.object({
  date: z.string().optional(),
  type: z.enum(["virtual", "inclinic"]).default("virtual"),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;

const route = publicProcedure
  .input(availabilitySchema)
  .query(async ({ input }) => {
    const baseTimes = ["09:00", "09:30", "10:00", "10:30", "11:00", "13:00", "13:30", "14:00", "15:00", "16:00"];
    const seed = (input.date ?? new Date().toISOString().slice(0, 10)).split("-").reduce((a, b) => a + Number(b), 0);
    const times = baseTimes.filter((_, idx) => (idx + seed) % 2 === 0);
    return { date: input.date, type: input.type, times };
  });

export default route;
