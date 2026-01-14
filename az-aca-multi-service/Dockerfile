# Multi-stage build for React frontend
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# Build React app with empty API base URL (BFF will handle proxying)
ENV VITE_API_BASE_URL=""
RUN npm run build

# Production image with Node.js BFF
FROM node:20-alpine
WORKDIR /app

# Copy built React app
COPY --from=build /app/dist ./dist

# Copy BFF server
COPY frontend/bff ./bff

# Install BFF dependencies
RUN cd bff && npm ci --production

# Environment variables (can be overridden at runtime)
ENV PORT=8080
ENV BACKEND_URL=http://localhost:5000

EXPOSE 8080

CMD ["node", "bff/server.js"]
