# Updated backend Dockerfile using Debian slim to avoid native-build issues on alpine
FROM node:18-bullseye-slim AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production
COPY . .

FROM node:18-bullseye-slim
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app ./
RUN groupadd -r appgroup && useradd -r -g appgroup appuser && chown -R appuser:appgroup /usr/src/app
USER appuser
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
