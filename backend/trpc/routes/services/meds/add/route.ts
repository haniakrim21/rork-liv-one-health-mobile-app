import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { medsStore } from "@/backend/trpc/routes/services/meds/list/route";

const addSchema = z.object({ name: z.string().min(1), dose: z.string().min(1), schedule: z.string().min(1) });

const route = publicProcedure
  .input(addSchema)
  .mutation(async ({ input }) => {
    const med = { id: `med_${Date.now()}`, name: input.name, dose: input.dose, schedule: input.schedule };
    medsStore.meds = [med, ...medsStore.meds].slice(0, 50);
    return med;
  });

export default route;
