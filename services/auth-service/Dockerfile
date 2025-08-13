FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY services/auth-service ./services/auth-service
RUN corepack enable && pnpm -v && pnpm install --frozen-lockfile
RUN pnpm --filter @app/common-config build \
 && pnpm --filter @app/common-logging build \
 && pnpm --filter @app/common-rmq build \
 && pnpm --filter auth-service build
WORKDIR /app/services/auth-service
EXPOSE 3002
CMD ["node","dist/main.js"]
