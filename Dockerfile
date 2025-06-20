#############################
# DEVELOPMENT
#############################
FROM node:22.16-alpine AS development

WORKDIR /usr/src/app

# Install dependencies early for better layer caching
COPY --chown=node:node package*.json ./
RUN npm ci

# Copy source files
COPY --chown=node:node . .

# Generate Prisma client
RUN npx prisma generate

# Set non-root user
USER node

#############################
# BUILD
#############################
FROM node:22.16-alpine AS build

WORKDIR /usr/src/app

# Copy everything from dev
COPY --chown=node:node --from=development /usr/src/app /usr/src/app

# Build app
RUN npm run build

# Strip dev dependencies and clean cache
RUN npm prune --omit=dev && npm cache clean --force

#############################
# PRODUCTION
#############################
FROM node:22.16-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy runtime essentials
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma
COPY --chown=node:node --from=build /usr/src/app/package*.json ./

# ✅ Ensure /uploads folder exists with correct ownership
RUN mkdir -p /usr/src/app/uploads && chown -R node:node /usr/src/app/uploads

# Re-generate Prisma client (if needed)
RUN npx prisma generate

# Run as non-root for security
USER node

# Start server
CMD [ "npm", "run", "start:docker" ]
