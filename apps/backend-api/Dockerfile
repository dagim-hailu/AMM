FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. Copy everything from the root context
COPY . .

# 2. Install all dependencies for the monorepo
RUN npm install
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# 3. Build the specific app (adjust if using turbo)
RUN npm run build

# 4. Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built files from the correct path in the base stage
COPY --from=base /app/apps/backend-api/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/backend-api/package.json ./package.json

EXPOSE 3002
CMD ["node", "dist/main.js"]
