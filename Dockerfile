# syntax=docker/dockerfile:1

# ── deps ────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── builder ─────────────────────────────────────────────────────────────
# Also the image the `migrate` service runs from: it is the only stage
# that has drizzle-kit and tsx.
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next inlines NEXT_PUBLIC_* at build time, so the public origin has to be
# present here — it is the URL encoded into every printed QR code.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
# Never used to sign anything — the build has no business holding the real
# secret, and without a value Better Auth warns once per page collected.
ENV BETTER_AUTH_SECRET=build-time-placeholder
# Next expects this directory even when a project has nothing static to
# serve; the runner copies it, and a missing one fails the whole build.
RUN mkdir -p public && npm run build

# ── runner ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# The migrator and the SQL it applies. Next only traces what the app
# imports, and nothing imports the migrator, so its two packages are
# copied in explicitly rather than left to chance.
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/scripts/migrate.mjs ./scripts/migrate.mjs
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/postgres ./node_modules/postgres

# Uploaded photos live on a volume mounted here.
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

# Migrate, then serve. A failed migration exits non-zero, the container
# never becomes healthy, and the deploy rolls back to the previous one.
CMD ["sh", "-c", "node scripts/migrate.mjs && node server.js"]
