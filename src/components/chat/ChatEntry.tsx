import { Post } from "@prisma/client"


export const ChatEntry = ({
    entry
}: {
    entry: Post
}) => {

    const { message, createdAt, username } = entry;

    return (
        
        <p 
            className="break-all cursor-pointer w-fit h-fit"
            onClick={() => {navigator.clipboard.writeText(message)}}
        >
            $ {username} - {message} - {createdAt.toString()}
        </p>
    )
}