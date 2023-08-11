import { type Post } from "@prisma/client";
import { type Web5 } from "@tbd54566975/web5";
import { create } from 'zustand';


interface Web5State<T> {
    did?: string;
    records:T[];
    api?: Web5;
    ready: boolean;
    setDid: (updatedDid: string) => void;
    setRecords: (updatedRecords: T[]) => void;
    setApi: (updatedApi: Web5) => void;
    setReady: (updateReady: boolean) => void;
};

export const useWeb5Store = create<Web5State<Post>>()((set) => {

    return ({
        records: [],
        ready: false,
        setDid: (updatedDid: string) => set((state) => ({
            did: state.did ?? updatedDid
        })),
        setRecords: (updatedRecords: Post[]) => set((_) => ({
            records: updatedRecords
        })),
        setApi: (updatedApi: Web5) => set((_) => ({
            api: updatedApi
        })),
        setReady: (updatedReady: boolean) => set((_) => ({
            ready: updatedReady
        }))
    })
});