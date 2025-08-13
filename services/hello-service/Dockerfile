FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
COPY packages ./packages
COPY services/hello-service ./services/hello-service
RUN corepack enable && pnpm -v && pnpm install --filter hello-service...
WORKDIR /app/services/hello-service
RUN pnpm build
EXPOSE 3001
CMD ["node","dist/main.js"]
