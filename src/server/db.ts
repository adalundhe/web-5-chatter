import { PrismaClient } from "@prisma/client";
import getConfig from "next/config";


const config = getConfig() as {
  publicRuntimeConfig: Record<string, string>
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const publicRuntimeConfig = config && config.publicRuntimeConfig ? config.publicRuntimeConfig : process.env;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
    publicRuntimeConfig.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (publicRuntimeConfig.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
