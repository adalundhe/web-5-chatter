import { ChatEntry } from "./ChatEntry";
import { useCallback } from "react";
import { useChatStore } from "~/utils/hooks";


export const ChatEntryList = () => {

    const {
        infoMessages,
        messages

    } = useChatStore(useCallback((state) => ({
        infoMessages: state.infoMessages,
        messages: state.messages
    }), []));
    

    return (
        <>
        {
            messages.map((entry, idx) => <ChatEntry entry={entry} key={`${entry.id}-${idx}`} />) 
        }
        {
            infoMessages?.map((info, idx) => 
                <div>
                    <p className="whitespace-pre" key={`info-${idx}`}>{info}</p>
                </div>
            )
        }
        </>
    )
}