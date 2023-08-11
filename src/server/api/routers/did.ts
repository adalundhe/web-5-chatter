
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";



export const didRouter = createTRPCRouter({
  getDid: publicProcedure
    .query(async ({ ctx }) => {
        return {
            did: "test"
        }
    })

});
