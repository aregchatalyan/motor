# --- Base Stage ---
FROM node:24-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN apk add --no-cache openssl libc6-compat
RUN npm ci

# --- Build Stage ---
FROM base AS build
COPY . .
RUN npx prisma generate
RUN npm run build

# --- Production Stage ---
FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma

RUN mkdir -p ./uploads && chown -R node:node ./uploads

USER node

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && npm run start:prod"]
