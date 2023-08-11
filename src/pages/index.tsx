import Head from "next/head";
import { ChatTerminal } from "../components/chat";
import { useWeb5 } from "../utils/hooks";
import { Keyboard } from "../components/keyboard";


export default function Home() {
  
  const { ready } = useWeb5();

  return (
    <>
      <Head data-testid="chatter-head">
        <title data-testid="chatter-title">Web5 Chatter</title>
        <meta data-testid="chatter-meta" name="description" content="Web5 Chat App" />
        <link data-testid="chatter-header-link" rel="icon" href="/favicon.ico" />
      </Head>
      <main data-testid="chatter-main" className="flex h-screen w-screen flex-col items-center justify-center text-slate-50 bg-zinc-700">  
        {
          ready ? <ChatTerminal/> : <p data-testid="chatter-loading">Loading...</p>
        }
        <Keyboard/>
      </main>
    </>
  );
}


