FROM node:20-alpine AS deps

WORKDIR /app

# Install system dependencies required by Prisma
RUN apk add --no-cache openssl libc6-compat

# Install all dependencies (including dev for typescript build)
COPY package*.json ./
RUN npm ci

# Build stage - compile TypeScript to JavaScript
FROM deps AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (dummy DATABASE_URL needed at generate time for Prisma 7)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

# Compile TypeScript
RUN npm run build

# Production image - only copy compiled output
FROM node:20-alpine AS runner

WORKDIR /app

# Install system dependencies required by Prisma at runtime
RUN apk add --no-cache openssl libc6-compat

# Copy package files and full node_modules from builder, then prune dev deps
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
RUN npm prune --omit=dev

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist

# Copy prisma schema and generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/index.js"]
