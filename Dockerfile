# Dockerfile

# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
# Using --legacy-peer-deps as it might be needed for some dependency trees
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Disable Next.js telemetry during the build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application
RUN npm run build

# Stage 2: Create the production image
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0" # Necessary to accept connections from outside the container

# Copy only the necessary files from the builder stage
# This leverages the standalone output from Next.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
# server.js is created by `next build` when `output: 'standalone'` is set in next.config.js
CMD ["node", "server.js"]
