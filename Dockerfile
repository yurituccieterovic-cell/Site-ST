FROM node:20-slim
RUN npm install -g pnpm
WORKDIR /app
COPY aliancapanorama-src/package.json aliancapanorama-src/pnpm-lock.yaml aliancapanorama-src/pnpm-workspace.yaml ./
COPY aliancapanorama-src/ ./
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @workspace/api-server run build
EXPOSE 8080
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
