
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN  npm install --production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

FROM node:18-alpine AS runner
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ENV DATABASE_URL=DATABASE_URL
ENV NEXTAUTH_SECRET=NEXTAUTH_SECRET

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV NEXTAUTH_URL=http://localhost:3000
ENV APP_URL=http://localhost:3000
ENV WS_URL=localhost:3001
ENV SKIP_ENV_VALIDATION=true


CMD ["npm", "start"]