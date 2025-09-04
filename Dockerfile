FROM node:22-alpine AS base

WORKDIR /app

COPY --chown=node:node package*.json .

RUN npm ci

# --- Build Stage ---
FROM base AS build

COPY --chown=node:node . .

RUN npx prisma generate

RUN npm run build

# --- Production Stage ---
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/package.json ./package.json
COPY --chown=node:node --from=build /app/prisma ./prisma

RUN mkdir -p ./uploads && chown -R node:node ./uploads

USER node

CMD [ "sh", "-c", "npx prisma migrate deploy && npm run start:prod" ]
