import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import requestOtp from "./routes/auth/request-otp/route";
import verifyOtp from "./routes/auth/verify-otp/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    requestOtp,
    verifyOtp,
  }),
});

export type AppRouter = typeof appRouter;