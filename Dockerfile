# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files of workspace
COPY Craft-Companion/package*.json ./Craft-Companion/
COPY Craft-Companion/client/package*.json ./Craft-Companion/client/
COPY Craft-Companion/server/package*.json ./Craft-Companion/server/

# Install dependencies (workspaces support)
RUN cd Craft-Companion && npm install

# Copy all source files
COPY . .

# Build server and client
RUN cd Craft-Companion && npm run build --workspace server
RUN cd Craft-Companion && npm run build --workspace client

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy production package files
COPY Craft-Companion/package*.json ./Craft-Companion/
COPY Craft-Companion/server/package*.json ./Craft-Companion/server/

# Install production dependencies for server workspace
RUN cd Craft-Companion && npm install --omit=dev --workspace server

# Copy built code and public/static files from builder stage
COPY --from=builder /app/Craft-Companion/server/dist ./Craft-Companion/server/dist
COPY --from=builder /app/Craft-Companion/client/dist ./Craft-Companion/client/dist
COPY --from=builder /app/Craft-Companion/client/public ./Craft-Companion/client/public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=7860

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Start command
CMD ["node", "Craft-Companion/server/dist/index.js"]
