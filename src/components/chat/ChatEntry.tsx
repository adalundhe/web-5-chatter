import { type Post } from "@prisma/client"


export const ChatEntry = ({
    entry
}: {
    entry: Post
}) => {

    const { message, createdAt, username } = entry;

    return (
        
        <p 
            data-testid={`chatter-message-${entry.id}`}
            className="break-all cursor-pointer w-fit h-fit"
            onClick={() => {void navigator.clipboard.writeText(message)}}
        >
            $ {username} - {message} - {createdAt.toString()}
        </p>
    )
}