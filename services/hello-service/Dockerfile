FROM node:20-alpine

WORKDIR /app

# Root workspace files (needed for TS config & pnpm workspaces)
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml tsconfig.base.json ./

# Copy only what we need to build hello-service and its local deps
COPY packages ./packages
COPY services/hello-service ./services/hello-service

# Enable pnpm and install deps for the whole workspace (dev deps included so TS can compile)
RUN corepack enable && pnpm -v && pnpm install --frozen-lockfile

# Build shared packages first, then the service (or just build all)
# Uncomment the single line if you prefer to build everything:
# RUN pnpm -r build
RUN pnpm --filter @app/common-config build \
 && pnpm --filter @app/common-logging build \
 && pnpm --filter @app/common-rmq build \
 && pnpm --filter hello-service build

# Run the compiled service
WORKDIR /app/services/hello-service
EXPOSE 3001
CMD ["node","dist/main.js"]
