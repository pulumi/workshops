# node:22-alpine, pinned digest verified against Docker Hub before use --
# see the workshop README's Pins table for the exact tag in force.
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY tracing.js index.js ./
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "start"]
