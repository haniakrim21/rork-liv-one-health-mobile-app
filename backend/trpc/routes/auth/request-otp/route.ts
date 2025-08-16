import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const PHONE_REGEX = /^\+?966\d{9}$/;

export default publicProcedure
  .input(z.object({ phone: z.string().regex(PHONE_REGEX, "Invalid Saudi phone number") }))
  .mutation(async ({ input }: { input: { phone: string } }) => {
    console.log("[auth.requestOtp] Requesting OTP for", input.phone);

    await new Promise((res) => setTimeout(res, 300));

    const ok = true;

    if (!ok) {
      throw new Error("Failed to send OTP. Please try again later.");
    }

    return { success: true as const, expiresInSec: 300 };
  });