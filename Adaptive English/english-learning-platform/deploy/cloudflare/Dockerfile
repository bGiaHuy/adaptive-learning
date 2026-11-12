FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY .artifacts/cloudflare-build/app/package.json .artifacts/cloudflare-build/app/package-lock.json ./
RUN npm ci --include=dev
COPY .artifacts/cloudflare-build/app/ ./
RUN DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build node scripts/build-vercel.cjs --schema-only && npx prisma generate --schema prisma/schema.vercel.prisma
RUN node scripts/generate-cloudflare-prisma.cjs
RUN npm run build

FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=node:node /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build --chown=node:node /app/src/generated/cloudflarePrisma ./src/generated/cloudflarePrisma
COPY --from=build --chown=node:node /app/node_modules/pdf-parse ./node_modules/pdf-parse
COPY --from=build --chown=node:node /app/node_modules/pdfjs-dist ./node_modules/pdfjs-dist
COPY --from=build --chown=node:node /app/node_modules/@napi-rs ./node_modules/@napi-rs
COPY --from=build --chown=node:node /app/data/dictionary.db.gz ./data/dictionary.db.gz
RUN node -e "const fs=require('fs');fs.writeFileSync('data/dictionary.db',require('zlib').gunzipSync(fs.readFileSync('data/dictionary.db.gz')));fs.unlinkSync('data/dictionary.db.gz');" && chown -R node:node /app/data
ENV NODE_ENV=production PORT=8080 HOSTNAME=0.0.0.0 DICTIONARY_DB_PATH=/app/data/dictionary.db
USER node
EXPOSE 8080
CMD ["node", "server.js"]
