FROM node:24-slim
RUN npm install -g pnpm@9 --silent

WORKDIR /app

COPY pnpm-workspace.yaml package.json tsconfig.base.json tsconfig.json ./
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

RUN pnpm install --no-frozen-lockfile

RUN pnpm --filter @workspace/api-server run build

ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
