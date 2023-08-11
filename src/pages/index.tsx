import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { ChatTerminal } from "~/components/chat";
import { useWeb5 } from "~/utils/hooks";
import { Keyboard } from "~/components/keyboard";



let db: IDBDatabase;
let version = 1;


export default function Home() {
  
  const { ready } = useWeb5();

  return (
    <>
      <Head>
        <title>Web5 Chatter</title>
        <meta name="description" content="Web5 Chat App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen w-screen flex-col items-center justify-center text-slate-50 bg-zinc-700">  
        {
          ready ? <ChatTerminal/> : 'Loading...'
        }
        <Keyboard/>
      </main>
    </>
  );
}


