FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build typescript (if needed) or just run
RUN npm run build || echo "No build script"

EXPOSE 4000

CMD ["npx", "ts-node", "src/index.ts"]
