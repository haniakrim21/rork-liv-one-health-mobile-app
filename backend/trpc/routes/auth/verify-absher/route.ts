import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(
    z.object({
      requestId: z.string(),
      code: z.string().min(4),
    })
  )
  .mutation(async ({ input }: { input: { requestId: string; code: string } }) => {
    console.log("[auth.verifyAbsher] Verifying Nafath/Absher callback", { requestId: input.requestId });

    await new Promise((res) => setTimeout(res, 250));

    const ok = input.code === "0000";
    if (!ok) {
      throw new Error("Failed to verify identity. Please try again.");
    }

    return {
      success: true as const,
      verified: true as const,
      profile: {
        firstName: "LIV",
        lastName: "User",
        nationalId: "1234567890",
        phone: "+966512345678",
      },
    };
  });