
import { useCallback, useEffect } from "react";
import { useIndexDBStore } from "./useIndexDBStore";
import Dexie from "dexie";


export const useIndexDB  = ({
    name,
    version,
    tables
}: {
    name: string,
    version: number,
    tables: Record<string, string[]>
}) => {

    const {
        db,
        updateDB
    } = useIndexDBStore(useCallback((state) => ({
        db: state.db,
        updateDB: state.setDB
    }), []))


    useEffect(() => {

        const db = new Dexie(name);
        const stores: Record<string, string> = {};

        for (const [table, fields] of Object.entries(tables)){

            stores[table] = fields.join(',');
        }

        db.version(version).stores(stores);
        updateDB(db)

    }, [])

    return {
        db
    }

}