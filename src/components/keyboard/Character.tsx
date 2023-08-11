import { useEffect, useState } from "react";

export const Character = ({
    letter,
    charNumbers,
    isSpaceBar
}: {
    letter: string,
    charNumbers: number[]
    isSpaceBar: boolean
}) => {

    const [active, setActive] = useState(false);

    const keyDownHandler = (e: KeyboardEvent) => {

        const characterCode = e.key.charCodeAt(0);
        if (!active && charNumbers.includes(characterCode) && e.key.length === 1) {

            setActive(true)

            setTimeout(() => {
                setActive(false);
            }, 150)

        }
    };


  
    useEffect(() => {

         window.addEventListener('keydown', keyDownHandler, false);
         
      return () => {
        window.removeEventListener('keydown', keyDownHandler, false)
      };

    }, []);
    
    

    return (
        <p 
            className={
                `${isSpaceBar ? 'w-[500px] h-[60px]' : 'w-[50px] h-[50px]'} text-slate-50 text-xl text-center flex justify-center items-center m-4 border border-slate-50 rounded-sm ${active ? 'bg-slate-50 text-slate-900 shadow-md shadow-slate-900' : ''}`
            }
        >
            {letter}
        </p>
    )
}