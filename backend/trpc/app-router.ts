import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import requestOtp from "@/backend/trpc/routes/auth/request-otp/route";
import verifyOtp from "@/backend/trpc/routes/auth/verify-otp/route";
import startAbsher from "@/backend/trpc/routes/auth/start-absher/route";
import verifyAbsher from "@/backend/trpc/routes/auth/verify-absher/route";
import getStats from "@/backend/trpc/routes/dashboard/get-stats/route";
import availability from "@/backend/trpc/routes/services/availability/route";
import book from "@/backend/trpc/routes/services/book/route";
import medsList from "@/backend/trpc/routes/services/meds/list/route";
import medsAdd from "@/backend/trpc/routes/services/meds/add/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    requestOtp,
    verifyOtp,
    startAbsher,
    verifyAbsher,
  }),
  dashboard: createTRPCRouter({
    getStats,
  }),
  services: createTRPCRouter({
    availability,
    book,
    meds: createTRPCRouter({
      list: medsList,
      add: medsAdd,
    }),
  }),
});

export type AppRouter = typeof appRouter;