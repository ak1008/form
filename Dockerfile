# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Copy package.json and package-lock.json (or yarn.lock if you use yarn)
COPY package.json package-lock.json* ./

# Install dependencies using --frozen-lockfile to ensure exact versions from lockfile
# This also installs devDependencies needed for the build
RUN npm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
# This will use the 'next' command from node_modules/.bin
RUN npx next build

# Stage 2: Create the production image
FROM node:18-alpine AS runner
WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Set up a directory for Genkit temp files and ensure it's writable.
# The default user for node:alpine is root. If running as a non-root user later,
# ensure that user has write permissions here.
RUN mkdir -p /tmp/genkit && \
    chmod -R 777 /tmp/genkit
    # Using 777 for simplicity here to ensure writability for Genkit.
    # For production, more specific permissions are better.
    # If you create and switch to a non-root user (e.g., 'nextjs'), you would typically do:
    # RUN mkdir -p /tmp/genkit && chown nextjs:nextjs /tmp/genkit && chmod 700 /tmp/genkit

# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
# The standalone output produces a server.js file.
# By default, this will run as root.
# For better security in production, it's recommended to create a non-root user:
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs
# And then switch to that user before the CMD:
# USER nextjs
# If you do this, ensure /app and /tmp/genkit are appropriately owned/writable by this user.

CMD ["node", "server.js"]
