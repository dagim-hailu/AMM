FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY . .
RUN npm install
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Ensure you build the admin-dashboard specifically
RUN npm run build --filter=admin-dashboard

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built files
COPY --from=base /app/apps/admin-dashboard/.next ./.next
COPY --from=base /app/apps/admin-dashboard/package.json ./package.json
COPY --from=base /app/apps/admin-dashboard/public ./public
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/admin-dashboard/next.config.* ./

# MATCH YOUR DOCKER-COMPOSE PORT
EXPOSE 3001
CMD ["npm", "start"]
