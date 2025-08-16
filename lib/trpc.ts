import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import Constants from "expo-constants";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL as string;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const hostUri = (Constants as any)?.expoGoConfig?.hostUri ?? (Constants as any)?.manifest2?.extra?.expoGo?.hostUri ?? (Constants as any)?.manifest?.hostUri;
  if (hostUri && typeof hostUri === "string") {
    const [host] = hostUri.split(":");
    const protocol = host?.includes("localhost") || host?.match(/\d+\.\d+\.\d+\.\d+/) ? "http" : "https";
    return `${protocol}://${host}`;
  }

  throw new Error("No base url found. Set EXPO_PUBLIC_RORK_API_BASE_URL or ensure window.location is available.");
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});