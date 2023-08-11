# Web 5 Chatter

Web5Chatter is a chat application built using NextJS, TRPC, TBD's Web5-JS, websockets, and Prisma. It allows users to send messages to one another in real time, with DIDs as the basis for user identity. Web5Chatter's UI is a terminal (much like the one on your computer!), and comes with a handful of commands to make chatting fun and easy!


# Features

Currently Web5Chatter supports:
- Creation of public rooms via the `join <room_name>` command.
- Private DMs via the `dm <username> <message>` command.
- Viewing all users who have sent messages in the current room via the `whoishere` command.
- Changing your own username via the `setname <newusername>` command.
- Viewing the active room via the `whereami` command.
- Showing your DID via the `showdid` command.
- Clear the terminal via the `clear` command (for the duration of the session or until page reload).

Of course, you can also use the `help` command at any time to view a reference!


## How do I get started?

Web5Chatter assumes a relatively new version of NodeJS/npm, and we developed using Node 18.17.0 and NextJS 13.4.13. We also recommend using `pnpm`, which can be installed by running:

```
npm install -g pnpm
```

To get started, clone this repostiory:

```
git clone https://github.com/scorbettUM/web-5-chatter
```

Change into the cloned directory, and then run:

```
cd web-5-chatter && \
pnpm i && 
pnpm dev
```

When running locally, Web5Chatter defaults to using an SQLite database. The first time you run the application, Prisma will ask to make an initial migration. Go ahead and provide a name or skip the question as you feel is best.

Web5Chatter will then run both a development instance on port `3000` and independent development-version websocket server on port `3001`.


## What about testing?

TRPC and TRPC's subscriptions/websockets, while offering superior end-to-end typesafety, make unit testing extremely difficult due to mocking challenges (and the author's own stance on unit testing meaning the library is in herently architected as to be difficult to unit test). As a result, Web5Chatter opts for a comprehensive suite of integration/e2e Playwright tests.

In a future version, one could likely refactor the application, extract the majority of the websockets/subscription functionality and replace it with a library that caters more to unit testing (this would be ideal!). Extracting the websockets into its own backend service (for example, as a Fastify service) would also improvie testability and better separate concerns. As-is, NextJS is mainly designed to cater to serverless applications, which is all the more reason to pursue this avenue.


# What about running in production?

Web5Chatter can be built for production via `pnpm build`. Be aware, using the production version of the application requires issued HTTPS certs!


# Known issues?

- TRCP and NextJS will intermittently emit a warning/error about TRPC having an errant `useState` React Hook on initial boot. This can be ignored.