# Multi-stage Dockerfile for building and running a Next.js (App Router) app
# - build stage compiles the app
# - runner stage serves using `npm run start` (next start)

FROM node:18-bullseye-slim AS base
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies (separate stage so Docker cache is effective)
FROM base AS deps
COPY package.json package-lock.json* ./
# Ensure devDependencies (TypeScript etc.) are installed for the build stage
# base image sets NODE_ENV=production, override here so npm installs dev deps
ENV NODE_ENV=development
RUN npm ci --prefer-offline --no-audit --progress=false

# Build the application
FROM base AS builder
WORKDIR /app
# reuse installed node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runtime image
FROM node:18-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed to run
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000
# Use next start for production
CMD ["npm", "run", "start"]
