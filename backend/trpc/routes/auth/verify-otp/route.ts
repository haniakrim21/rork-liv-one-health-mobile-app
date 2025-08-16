import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const PHONE_REGEX = /^\+?966\d{9}$/;
const CODE_REGEX = /^\d{6}$/;

export default publicProcedure
  .input(
    z.object({
      phone: z.string().regex(PHONE_REGEX, "Invalid Saudi phone number"),
      code: z.string().regex(CODE_REGEX, "Invalid verification code"),
    })
  )
  .mutation(async ({ input }: { input: { phone: string; code: string } }) => {
    console.log("[auth.verifyOtp] Verifying OTP", { phone: input.phone });

    await new Promise((res) => setTimeout(res, 300));

    const isValid = input.code === "123456";

    if (!isValid) {
      throw new Error("Invalid or expired code. Please try again.");
    }

    const token = `mock-token-${Date.now()}`;

    return { success: true as const, token, profile: { firstName: 'LIV', lastName: 'User', phone: input.phone } };
  });