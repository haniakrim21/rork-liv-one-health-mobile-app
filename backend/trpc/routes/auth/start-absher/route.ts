import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(
    z.object({
      nationalId: z.string().min(8).max(20).optional(),
      phone: z.string().regex(/^\+?966\d{9}$/, "Invalid Saudi phone number").optional(),
      locale: z.enum(["ar", "en"]).default("en"),
    })
  )
  .mutation(async ({ input }: { input: { nationalId?: string; phone?: string; locale: "ar" | "en" } }) => {
    console.log("[auth.startAbsher] Start Nafath/Absher flow", { nationalId: input.nationalId, phone: input.phone, locale: input.locale });

    await new Promise((res) => setTimeout(res, 200));

    const requestId = `absher-${Date.now()}`;
    const redirectUrl = `https://example.absher.sa/oauth/authorize?request_id=${encodeURIComponent(requestId)}&locale=${input.locale}`;

    return { requestId, redirectUrl };
  });