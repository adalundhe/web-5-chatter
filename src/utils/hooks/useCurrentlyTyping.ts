import { useCallback, useEffect } from "react";
import { api } from "~/utils/api";
import { useChatStore } from "./useChatStore";


export const useCurrentlyTyping = () => {

    const {
        room,
        username,
        updateCurrentlyTyping

    } = useChatStore(useCallback((state) => ({
        room: state.room,
        username: state.username,
        updateCurrentlyTyping: state.setCurrentlyTyping
    }), []))

    
    api.chat.whoIsTyping.useSubscription({
        room
      }, {
        onData(data) {
          updateCurrentlyTyping(data.filter(
            typingUsername => typingUsername !== username
          ));
        },
      });

    useEffect(() => {
    
        updateCurrentlyTyping([])

    }, [])
}