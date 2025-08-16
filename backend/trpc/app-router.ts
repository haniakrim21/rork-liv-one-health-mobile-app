import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import requestOtp from "@/backend/trpc/routes/auth/request-otp/route";
import verifyOtp from "@/backend/trpc/routes/auth/verify-otp/route";
import startAbsher from "@/backend/trpc/routes/auth/start-absher/route";
import verifyAbsher from "@/backend/trpc/routes/auth/verify-absher/route";

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
});

export type AppRouter = typeof appRouter;