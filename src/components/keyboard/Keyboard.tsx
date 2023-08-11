import { useEffect, useState } from "react";
import { Character } from "./Character";


export const Keyboard = () => {

    const [characters, setCharacters] = useState<Record<string, number[]>>({});

    useEffect(() => {

        const keyboardCharacters: Record<string, number[]> = {};

        for (let idx=33; idx<127; idx++){

            let character = String.fromCharCode(idx);

            if (idx >= 97 && idx <= 122){

                const upperCaseCode = character.toUpperCase().charCodeAt(0);
                character = String.fromCharCode(upperCaseCode);
                keyboardCharacters[character]?.push(idx)

            } else {
                keyboardCharacters[character] = [
                    idx
                ];

            }

        }

        setCharacters(keyboardCharacters);

    }, [])



    return (
        <div 
            className="w-1/2 flex flex-wrap items-center justify-center mb-10"
            data-testid="chatter-keyboard-container"
        >
            {
                Object.entries(characters).map(([letter, charNumbers], idx) => <Character 
                    key={`character-${idx}`}
                    letter={letter}
                    charNumbers={charNumbers}
                    isSpaceBar={false}
                />)
            }
            <div 
                className="w-full flex justify-center items-center mt-10"
                data-testid="chatter-keyboard-spacebar-container"
            >
                <Character 
                    key={`character-32`}
                    letter={' '}
                    charNumbers={[32]}
                    isSpaceBar={true}
                />
            </div>
        </div>
    )
}