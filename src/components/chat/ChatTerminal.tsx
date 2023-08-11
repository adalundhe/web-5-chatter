import { useCallback } from 'react';
import Terminal, { ColorMode } from 'react-terminal-ui';
import { api } from "../../utils/api";
import { 
    useMessages, 
    useCurrentlyTyping, 
    useChatStore, 
    useWeb5
} from '../../utils/hooks';
import { ChatEntryList } from './ChatEntryList';


const helpText = `
Web5 Chatter Help

Commands:
                    
    - clear: Clear terminal.
    - setname: Change display username.
    - whoami: Show current display username.
    - showdid: Show user DID.
    - whoishere: Show all currently active users.
    - dm <user> <message>: Send a DM to the specified user.
    - join <room>: Switch to or create a public room.
    - help: Show help.

To send a message to the current room (default), click the terminal, type, and press enter!

`


export const ChatTerminal = () => {

    const submitMutation = api.chat.submit.useMutation();
    const typingMutation = api.chat.isTyping.useMutation();
    const usernameMutation = api.chat.updateName.useMutation();
    
    const {
        did,
        ready,
        db,
        web5
    } = useWeb5();


    const {
        room,
        username,
        roomUsers,
        updateMessages,
        updateInfoMessages,
        updateUsername,
        updateRoom

    } = useChatStore(useCallback((state) => ({
        room: state.room,
        username: state.username,
        roomUsers: state.roomUsers,
        updateMessages: state.setMessages,
        updateInfoMessages: state.setInfoMessages,
        updateUsername: state.setUsername,
        updateRoom: state.setRoom
    }), []))



    const commands: Record<string, (message?: string) => void> = {
        clear: (_?: string) => {
          updateMessages([])
          updateInfoMessages([])
        },
        setname: (message?: string) => {
    
          const commandString = message?.split(' ')
          const ready = commandString && commandString.length > 1 && db && did;
    
          if (ready){

            const updatedUsername = commandString.at(1) ?? username;
            updateUsername(updatedUsername) 

            void db.table('users').put({
                did,
                username: updatedUsername
            }, [did])

            void usernameMutation.mutateAsync({
                did,
                username,
                room
            })

          }
    
        },
        whoami: (_?: string) => {
            updateInfoMessages([
                `Username: ${username}`
            ]) 
        },
        showdid: (_?: string) => {
            did && updateInfoMessages([
                did
            ])
        },
        whoishere: (_?: string) => {
            const usernames = Object.keys(roomUsers).join(', ')

            updateInfoMessages([
                `Active users include: ${usernames}`
            ])
        },
        whereami: (_? : string) => {
            updateInfoMessages([
                `Current room: ${room}`
            ])
        },
        help: (_?: string) => {
            updateInfoMessages([
                helpText
            ])
        },
        join: (message?: string) => {

            const commandString = message?.split(' ')
            const updatedRoom = commandString?.at(1);
            const ready = updatedRoom && did;

            if (ready){

                usernameMutation.mutate({
                    did,
                    username,
                    room: updatedRoom
                });

                updateRoom(updatedRoom)
                updateMessages([])
                updateInfoMessages([
                    `Joined public room - ${updatedRoom}`
                ])
            }

   
        }
    }
    
    useMessages();
    useCurrentlyTyping();

    const onInput = async (message: string) => {
                    
        const commandString = message.split(' ');
        const commandName = commandString.length > 0 ? commandString.at(0) : "";
        const command = commands[commandName ?? ""];

        const validMessage = message.replace(/\s/g, '').length > 0;

        if (commandName === 'dm' && commandString.length > 2 && web5 && validMessage) {

            const user = commandString.at(1) ?? "";
            const message = commandString.slice(2,).join(' ');

            const userDid = roomUsers[user];

            userDid && await typingMutation.mutateAsync({
                room,
                username,
                typing: true
            });

            did && userDid && await submitMutation.mutateAsync({
                room: userDid,
                message,
                username,
                did,
                user
            });  

            const { record } = await web5.dwn.records.create({
                data: {
                    room: userDid,
                    message,
                    username,
                    did
                },
                message: {
                    recipient: userDid
                }
            })

            userDid && await record?.send(userDid);

        } else if (command){
            command(message)
        } else if (validMessage) {

            await typingMutation.mutateAsync({
                room,
                username,
                typing: true
            });
    
            did && await submitMutation.mutateAsync({
                room,
                message,
                username,
                did
            }); 
        }
    }

    return (
        <div className="h-1/2 w-3/4 break-all" data-testid="chatter-terminal-container">
              {
                ready && did ?
                <Terminal
                    data-testid="chatter-terminal"
                    name='Web5 Chatter' 
                    height="36vh"
                    colorMode={ ColorMode.Dark }  
                    onInput={(message: string) => {
                          
                        
                        void onInput(message);

                    }} 
                
                >
                    <ChatEntryList/>
                </Terminal> : null
              }
            </div>
    )
}