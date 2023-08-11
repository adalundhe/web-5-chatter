import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "../../../server/api/root";
import { createTRPCContext } from "../../../server/api/trpc";

import getConfig from "next/config";

const { publicRuntimeConfig }: {
  publicRuntimeConfig: Record<string, string>
} = getConfig() as {
  publicRuntimeConfig: Record<string, string>
};


// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    publicRuntimeConfig.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
          );
        }
      : undefined,
});
