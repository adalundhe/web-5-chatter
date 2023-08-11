import { type Post } from '@prisma/client';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid'


interface ChatState {
    messages: Post[];
    infoMessages: string[];
    currentlyTyping: string[];
    room: string;
    username: string;
    roomUsers: Record<string, string>;
    setMessages: (updatedMessages: Post[]) => void;
    setInfoMessages: (updatedInfoMessages: string[]) => void;
    setCurrentlyTyping: (updatedTypingUsers: string[]) => void;
    setRoom: (updatedRoom: string) => void;
    setUsername: (updatedUsername: string) => void;
    setRoomUsers: (updateRoomUsers: Record<string, string>) => void;
}


export const useChatStore = create<ChatState>()((set) => ({
    messages: [],
    infoMessages: [],
    currentlyTyping: [],
    room: "default",
    username: uuidv4(),
    roomUsers: {},
    setMessages: (updatedMessages: Post[]) => set((state) => {

        if (updatedMessages.length < 1){
            return ({
                messages: []
            })
        }

        const map: Record<Post['id'], Post> = {};
        
        for (const msg of state.messages) {
            map[msg.id] = msg;
        }

        for (const msg of updatedMessages){
            map[msg.id] = msg
        }

        const messages = Object.values(map).sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );
    

        return ({
            messages
        })
    }),
    setInfoMessages: (updatedInfoMessages: string[]) => set((_) => ({
        infoMessages: updatedInfoMessages
    })),
    setCurrentlyTyping: (updatedTypingUsers: string[]) => set((_) => ({
        currentlyTyping: updatedTypingUsers
    })),
    setRoom: (updatedRoom: string) => set((_) => ({
        room: updatedRoom,
        roomUsers: {}
    })),
    setUsername: (updatedUsername: string) => set((_) => ({
        username: updatedUsername
    })),
    setRoomUsers: (updateRoomUsers: Record<string, string>) => set((state) => ({
        roomUsers: {
            ...state.roomUsers,
            ...updateRoomUsers
        }
    }))
}));