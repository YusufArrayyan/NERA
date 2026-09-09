FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy prisma schema early
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate || true

# Copy all remaining source code
COPY . .

# Build application
RUN npm run build

# Production dependencies only
RUN npm ci --only=production

# Expose ports
EXPOSE 3000 9090

# Start application
CMD ["npm", "run", "start:prod"]
