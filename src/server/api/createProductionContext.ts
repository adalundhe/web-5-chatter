
import { EventEmitter } from 'events';
import { PrismaClient } from "@prisma/client";



export const createProductionContext = async () => {
  
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };
    

    const events = new EventEmitter();
    const typingUsers: Record<string, { lastTyped: Date }> = {}
    const typingIntervals: Record<string, NodeJS.Timer> = {}

    const prisma = globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  
    process.on('SIGTERM', () => {
      for (const interval of Object.keys(typingIntervals)){
        clearInterval(interval);
      }
    });
  
    return {
      prisma,
      events,
      typingUsers,
      typingIntervals
    };
  };