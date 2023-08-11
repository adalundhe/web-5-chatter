
import { useCallback, useEffect } from "react";
import { api } from "~/utils/api";
import { useChatStore } from "./useChatStore";
import { useIndexDBStore } from "./useIndexDBStore";
import { useWeb5 } from "./useWeb5";
import Dexie from "dexie";
import { Post } from "@prisma/client";



const updateUsersIndexDB = async ({
    db,
    did,
    username
}: {
    db: Dexie,
    did: string,
    username: string
}) => {

    const users = await db.table('users');

    await users.put({
        did,
        username
    }, [did])

}


export const useMessages = () => {

    const {
        room,
        username,
        roomUsers,
        updateMessages,
        updateRoomUsers,
        updateInfoMessages

    } = useChatStore(useCallback((state) => ({
        room: state.room,
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

                updateUsersIndexDB({
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

                const [did, _] = user;

                const username = usernameUpdate.username;
                
                updateRoomUsers({
                    [username]: did
                });

            }

        }
    });

    useEffect(() => {

        const msgs = postsQuery.data?.pages
            .map((page) => page.items)
            .flat() ?? [];

        
        const users: Record<string, string> = {};
        msgs.forEach(message => users[message.username] = message.did);

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
                    records.map(async (record) => await record.data.json())
                );

                posts.concat(web5records as Post[]);

            }

            if (posts.length > 0){
                updateMessages(posts);
            }

        }

        getDidMessages();
        updateInfoMessages([]);
        updateMessages(msgs);
        updateRoomUsers(users);

      }, [
        postsQuery.data?.pages, 
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

