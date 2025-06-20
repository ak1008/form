# Stage 1: Builder
# Use an official Node.js LTS version. Alpine versions are smaller.
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
# Copy package.json and package-lock.json (if available)
COPY package.json ./
# If you have a package-lock.json, copy it too for consistent installs
COPY package-lock.json* ./
# If you have a .npmrc file, copy it as well
# COPY .npmrc ./

# Install dependencies. --frozen-lockfile is recommended if you have package-lock.json
# to ensure reproducible builds.
RUN npm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Set NEXT_TELEMETRY_DISABLED to 1 to prevent Next.js from trying to collect telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application
RUN npm run build

# Stage 2: Production image
# Use the same Node.js version as the builder for consistency
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security (Next.js standalone output often creates a 'nextjs' user)
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs
# USER nextjs

# Copy built assets from the builder stage
# Next.js with `output: 'standalone'` bundles the server and necessary node_modules.
COPY --from=builder --chown=1001:1001 /app/.next/standalone ./
COPY --from=builder --chown=1001:1001 /app/.next/static ./.next/static

# If you have a public folder with static assets, copy it
COPY --from=builder --chown=1001:1001 /app/public ./public

# Expose the port the app runs on (default is 3000)
EXPOSE 3000

# Define the GID for the nextjs user (or the user you're running as)
ENV GID=1001

# Start the app. `server.js` is at the root of the standalone output.
CMD ["node", "server.js"]
