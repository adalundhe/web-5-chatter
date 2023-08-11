import { Web5 } from "@tbd54566975/web5";
import { useEffect } from "react";
import { useCallback } from "react";
import { useWeb5Store } from "./useWeb5Store";
import { useChatStore } from "./useChatStore";
import { useIndexDB } from "./useIndexDB";


export const useWeb5 = () => {

    const {
        did,
        web5,
        ready,
        updateDid,
        updateApi,
        updateReady
    } = useWeb5Store(useCallback((state) => ({
        did: state.did,
        web5: state.api,
        ready: state.ready,
        updateDid: state.setDid,
        updateApi: state.setApi,
        updateReady: state.setReady
    }), []));


    const {
        username,
        updateUsername
    } = useChatStore(useCallback((state) => ({
        username: state.username,
        updateUsername: state.setUsername
    }), []))


    const { db } = useIndexDB({
        name: 'Web5',
        version: 1,
        tables: {
            users: ['did', 'username', 'created']
        }
    });


    useEffect(() => {

        const initializeWeb5 = async () => {
          if (db){
              
            const { web5, did } = await Web5.connect();

            const users = await db.table('users');

            const foundUsers: {
                did: string,
                username: string,
                created: string
            }[] = await users.toArray();


            if (foundUsers.length > 0){

                const user = foundUsers.pop();
                

                updateDid(user?.did as string)
                updateUsername(user?.username as string)

            } else {

                const created = new Date().toString()
                await users.put({
                    did,
                    username,
                    created
                }, [did])


                updateDid(did)

            }

            updateApi(web5)
            updateReady(true)


          }
        }

        initializeWeb5()

    }, [db])


    return ready ? {
        did,
        web5,
        ready,
        db
    } : {
        ready
    }

}