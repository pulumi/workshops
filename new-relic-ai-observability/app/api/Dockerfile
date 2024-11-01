FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json newrelic.js ./
COPY src/ ./src

CMD ["node", "--no-lazy", "-r", "ts-node/register", "-r", "newrelic", "--preserve-symlinks", "./src/index.ts"]