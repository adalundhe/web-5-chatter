import { type Post } from "@prisma/client"


export const ChatEntry = ({
    entry,
    idx
}: {
    entry: Post,
    idx: number
}) => {

    const { message, createdAt, username } = entry;

    return (
        
        <p 
            data-testid={`chatter-message-${idx}`}
            className="break-all cursor-pointer w-fit h-fit chatter-message"
            onClick={() => {void navigator.clipboard.writeText(message)}}
        >
            $ {username} - {message} - {createdAt.toString()}
        </p>
    )
}