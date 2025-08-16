import { publicProcedure } from "../../../create-context";

export type DashboardStats = {
  workoutsToday: number;
  calories: number;
  streakDays: number;
  lastSyncISO: string;
};

const getStats = publicProcedure.query((): DashboardStats => {
  const now = new Date();
  const stats: DashboardStats = {
    workoutsToday: 2,
    calories: 860,
    streakDays: 5,
    lastSyncISO: now.toISOString(),
  };
  return stats;
});

export default getStats;
