# Use a lightweight Node.js base image
FROM node:22-alpine AS base

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's cache
COPY --chown=node:node package*.json .

# Install dependencies using npm ci for a clean, repeatable install
RUN npm ci

# --- Build Stage ---
FROM base AS build

# Copy the rest of the application source code
COPY --chown=node:node . .

# Generate the Prisma client inside the build stage
RUN npx prisma generate

# Build the application
RUN npm run build

# --- Production Stage ---
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy only the necessary files for production from the build stage
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/package.json ./package.json
COPY --chown=node:node --from=build /app/prisma ./prisma

# Create the uploads directory and ensure correct ownership
RUN mkdir -p ./uploads && chown -R node:node ./uploads

# Switch to a non-root user for security
USER node

# Command to run the application, ensuring migrations are applied first
# NOTE: Avoid including sensitive .env files in the final image.
# Use Docker's native environment variable handling instead.
CMD [ "sh", "-c", "npx prisma migrate deploy && npm run start:prod" ]
