# DEVELOPMENT
FROM node:22-alpine AS development

WORKDIR /app

COPY --chown=node:node package*.json .

RUN npm ci

COPY --chown=node:node . .
COPY --chown=node:node .env .env

RUN npx prisma generate

USER node

# BUILD
FROM node:22-alpine AS build

WORKDIR /app

COPY --chown=node:node --from=development /app /app

RUN npm run build
RUN npm prune --omit=dev && npm cache clean --force

# PRODUCTION
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/prisma ./prisma
COPY --chown=node:node --from=build /app/package*.json ./
COPY --chown=node:node --from=build /app/.env .env

RUN mkdir -p ./uploads && chown -R node:node ./uploads

USER node

CMD [ "sh", "-c", "npx prisma migrate deploy && npm run start:prod" ]
