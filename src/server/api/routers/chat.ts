import { z } from "zod";
import { observable } from '@trpc/server/observable';
import { type Post } from "@prisma/client";
import {
  createTRPCRouter,
  publicProcedure
} from "../../api/trpc";



export const chatRouter = createTRPCRouter({
    join: publicProcedure
        .input(
            z.object({
                did: z.string().nullish(),
                username: z.string(),
                room: z.string()
                    .min(1),
            })
        )
        .subscription(async ({
            input,
            ctx
        }) => {

            const { events, typingIntervals, typingUsers, prisma } = ctx;
            const { room, username, did } = input;

            did && await prisma.user.upsert({
                create: {
                    username,
                    did,
                    room
                },
                update: {
                    username,
                    room
                },
                where: {
                   did
                }
            })
            
            return observable<Post>((emit) => {

                if (!typingIntervals[room]){

                    const interval = setInterval(() => {

                        let updated = false;
                        const now = Date.now();

                        for (const [key, value] of Object.entries(typingUsers)) {

                          if (now - value.lastTyped.getTime() > 3e3) {
                            delete typingUsers[key];
                            updated = true;
                          }

                        }

                        if (updated) {
                          events.emit(`${room}-isTypingUpdate`, {
                            username,
                            room
                          });
                        }

                      }, 3e3);

                      typingIntervals[room] = interval;

                }

                const onUpdate = async (data: Post) => {
                    emit.next(data);
                };

                events.on(room, onUpdate);

                did && events.on(did, onUpdate);

                events.emit(`${room}-nameUpdate`, {
                    username,
                    did
                })
                
                return () => {
                    events.off(room, onUpdate);
                    did && events.off(did, onUpdate);
                };
            });
        }),
    users: publicProcedure
        .input(
            z.object({
                room: z.string()
            })
        )
        .subscription(({
            input,
            ctx
        }) => {

            const { events } = ctx;
            const { room } = input;

            return observable<{
                username: string,
                did: string
            }>((emit) => {

                const onUpdate = async (data: {
                    username: string,
                    did: string
                }) => emit.next(data);

                events.on(`${room}-nameUpdate`, onUpdate)

                return () => {
                    events.off(`${room}-nameUpdate`, onUpdate)
                }
            })

        }),
    updateName: publicProcedure
        .input(
            z.object({
                room: z.string(),
                username: z.string(),
                did: z.string()
            })
        )
        .mutation(async ({
            input,
            ctx
        }) => {

            const { room, username, did } = input;
            const { events, prisma } = ctx;

            did && await prisma.user.upsert({
                create: {
                    username,
                    room,
                    did

                },
                update: {
                    username,
                    room
                },
                where: {
                    did
                }
            })

            events.emit(`${room}-nameUpdate`, {
                username,
                did
            })

        }),
    submit: publicProcedure
        .input(
            z.object({
                room: z.string()
                    .min(1),
                message: z.string()
                    .min(1),
                username: z.string()
                    .min(1),
                did: z.string()
                    .min(1),
                user: z.string().optional()
            })
        )
        .mutation(async ({ input, ctx }) => {

            const { events, prisma } = ctx;
            const { room, user, did, message, username } = input;

            const post = await prisma.post.create({
                data: {
                    room,
                    message,
                    did,
                    username
                },
            });

            user ? events.emit(
                did,
                post
            ) : events.emit(
                room, 
                post
            );

            return {
                ...input,
                status: 'active'
            }

        }),
    isTyping: publicProcedure
        .input(
            z.object({ 
                username: z.string(),
                room: z.string(),
                typing: z.boolean()
            })
        )
        .mutation(({ input, ctx }) => {

            const { events, typingUsers } = ctx;
            const { username, typing, room } = input;

            if (!typing) {

                delete typingUsers[username];

            } else {

                typingUsers[username] = {
                    lastTyped: new Date(),
                };

            }

            events.emit(`${room}-isTypingUpdate`, {
                username,
                room
            });

        }),
    whoIsTyping: publicProcedure
        .input(
            z.object({
                room: z.string()
                    .min(1),
            })
        )
        .subscription(({
            input,
            ctx
        }) => {
            
            let prev: string[] | null = null;
            const { room } = input;
            const { events, typingUsers } = ctx;

            return observable<string[]>((emit) => {
                
                const onIsTypingUpdate = () => {
                    const newData = Object.keys(typingUsers);
            
                    if (!prev || prev.toString() !== newData.toString()) {
                        emit.next(newData);
                    }

                    prev = newData;
                };
                events.on(`${room}-isTypingUpdate`, onIsTypingUpdate);
                return () => {
                    events.off(`${room}-isTypingUpdate`, onIsTypingUpdate);
                };
            });
        }),
    load: publicProcedure
        .input(
          z.object({
            did: z.string().nullish(),
            room: z.string(),
            cursor: z.date().nullish(),
            take: z.number().min(1).max(50).default(10),
          }),
        )
        .query(async ({ input, ctx }) => {

          const { take, cursor, room, did } = input;
          const { prisma } = ctx;

          const filters = did ? [
            { room },
            { room: did }
          ]: [ { room } ]
    
          const page = await prisma.post.findMany({
            orderBy: {
              createdAt: 'desc',
            },
            where: {
                OR: filters
            },
            cursor: cursor ? { createdAt: cursor } : undefined,
            take: take + 1,
            skip: 0,
          });

          const items = page.reverse();
          let prevCursor: typeof cursor | null = null;

          if (items.length > take) {
            const prev = items.shift();
            prevCursor = prev!.createdAt;
          }

          return {
            items,
            prevCursor,
          };
        }),
    loadUsers: publicProcedure
        .input(
            z.object({
                room: z.string()
                    .min(1),
                cursor: z.date().nullish(),
                take: z.number().min(1).max(1).default(1),
            })
        )
        .query(async ({
            input,
            ctx
        }) => {

            const { room, cursor, take } = input;
            const { prisma } = ctx;

            const page = await prisma.user.findMany({
                orderBy: {
                    createdAt: 'desc',
                  },
                where: {
                    room
                },
                cursor: cursor ? { createdAt: cursor } : undefined,
                take: take + 1,
                skip: 0,
            });

            const items = page.reverse();
            let prevCursor: typeof cursor | null = null;

            if (items.length > take) {
                const prev = items.shift();
                prevCursor = prev!.createdAt;
            }

            return {
                items,
                prevCursor,
            };
        })
});
