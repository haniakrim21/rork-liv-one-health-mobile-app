import { publicProcedure } from "@/backend/trpc/create-context";

export type Med = { id: string; name: string; dose: string; schedule: string };

const store: { meds: Med[] } = { meds: [] };

const route = publicProcedure.query(async () => {
  return { meds: store.meds };
});

export default route;
export { store as medsStore };
