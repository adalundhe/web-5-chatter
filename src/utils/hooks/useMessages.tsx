
import { useCallback, useEffect } from "react";
import { api } from "utils/api";
import { useChatStore } from "./useChatStore";
import { useIndexDBStore } from "./useIndexDBStore";
import { useWeb5 } from "./useWeb5";
import type Dexie from "dexie";
import { type Post } from "@prisma/client";



const updateUsersIndexDB = async ({
    db,
    did,
    username
}: {
    db: Dexie,
    did: string,
    username: string
}) => {

    const users = db.table('users');

    await users.put({
        did,
        username
    }, [did])

}


export const useMessages = () => {

    const {
        room,
        messages,
        username,
        roomUsers,
        updateMessages,
        updateRoomUsers,
        updateInfoMessages

    } = useChatStore(useCallback((state) => ({
        room: state.room,
        messages: state.messages,
        username: state.username,
        roomUsers: state.roomUsers,
        updateMessages: state.setMessages,
        updateRoomUsers: state.setRoomUsers,
        updateInfoMessages: state.setInfoMessages
    }), []))


    const {
        db
    } = useIndexDBStore(useCallback((state) => ({
        db: state.db
    }), []))


    const {
        did,
        web5
    } = useWeb5();

    const postsQuery = api.chat.load.useInfiniteQuery(
        {
            did,
            room,
        },
        {
            getPreviousPageParam: (d) => d.prevCursor,
        },
    );

    const usersQuery = api.chat.loadUsers.useInfiniteQuery(
        {
            room
        },
        {
            getPreviousPageParam: (d) => d.prevCursor,
        }
    )
        

    api.chat.join.useSubscription({
        did,
        username,
        room
    }, {
        onData(newPost) {

            if (db){

                const postUsername = newPost.username;
                const postDid = newPost.did;

                void updateUsersIndexDB({
                    db,
                    did: postDid,
                    username: postUsername
                })
                

                updateRoomUsers({
                    [postUsername]: postDid
                })

                updateInfoMessages([])
                updateMessages([newPost])

            }

        }
    });

    api.chat.users.useSubscription({
        room
    }, {
        onData(usernameUpdate) {
            const user = Object.entries(roomUsers)
                .filter(([did, _]) => did == usernameUpdate.did)
                .at(0);

            if (user){

                const [did, ] = user;

                const username = usernameUpdate.username;
                
                updateRoomUsers({
                    [username]: did
                });

            }

        }
    });

    useEffect(() => {
        
        const { 
                fetchNextPage
        } = postsQuery;

        const interval = setInterval(async () => {

            const query = await fetchNextPage();
            const msgs = query.data?.pages
                .map((page) => page.items)
                .flat() ?? [];
                
            const messageData: Record<string, Post> = {}

            for (const existingMessage of messages){
                messageData[existingMessage.id] = existingMessage;
            }

            for (const newMessage of msgs){
                messageData[newMessage.id] = newMessage;
            }

            const entries = Object.values(messageData)
                .sort((messageA: Post, messageB: Post) => messageB.createdAt.getTime() - messageA.createdAt.getTime())
                .slice(0, 10)

            const users: Record<string, string> = {};
            entries.forEach(message => users[message.username] = message.did);


            void getDidMessages();
            updateInfoMessages([]);
            updateMessages(entries);
            updateRoomUsers(users);


        }, 1000)

        
        

        const getDidMessages = async () => {

            const posts: Post[] = [];

            if(web5){
                const { records } = await web5.dwn.records.query({
                    message: {
                        filter: {
                            recipient: did
                        }
                    }
                });

                const web5records = records && await Promise.all(
                    records.map(async (record) => await record.data.json() as Post)
                );

                web5records && posts.concat(web5records);

            }

            if (posts.length > 0){
                updateMessages(posts);
            }

        }


        return () => clearInterval(interval)

      }, [
        postsQuery, 
        updateMessages
    ]);

    useEffect(() => {

        const users = usersQuery.data?.pages
            .map((page) => page.items)
            .flat() ?? [];

        
        const foundUsers: Record<string, string> = {};
        users.forEach(user => foundUsers[user.username] = user.did);

        updateRoomUsers(foundUsers);

      }, [
        messages,
        usersQuery.data?.pages, 
        updateMessages
    ]);

    useEffect(() => {

        const msgs = postsQuery.data?.pages
            .map((page) => page.items)
            .flat() ?? [];

        const users: Record<string, string> = {};

        msgs.forEach(message => users[message.username] = message.did);

        updateMessages(msgs);
        updateRoomUsers(users);

    }, []);


    useEffect(() => {

        updateRoomUsers({})

    }, [room]);
    

}

