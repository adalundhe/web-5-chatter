import Dexie, { DexieOptions } from "dexie";
import { create } from 'zustand'


interface IndexDBState {
    db?: Dexie;
    setDB: (updatedDB: Dexie) => void;
}

export const useIndexDBStore = create<IndexDBState>()((set) => ({
    setDB: (updatedDB: Dexie) => set((state) => ({
        db: state.db ?? updatedDB
    }))
}));