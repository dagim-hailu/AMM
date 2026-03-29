FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy everything for the monorepo context
COPY . .
RUN npm install

# Build only the public-web app
RUN npm run build --filter=public-web

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy Next.js production files
COPY --from=base /app/apps/public-web/.next ./.next
COPY --from=base /app/apps/public-web/package.json ./package.json
COPY --from=base /app/apps/public-web/public ./public
COPY --from=base /app/node_modules ./node_modules

EXPOSE 3000
# The correct command for Next.js production
CMD ["npm", "start"]
