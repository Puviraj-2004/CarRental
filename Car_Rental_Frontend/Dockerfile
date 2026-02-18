# ── Dependencies stage ──────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm ci


# ── Build stage ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules/
COPY . .

# Build-time env vars (Next.js inlines NEXT_PUBLIC_ at build time)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Server-side vars needed by next.config.js validation at build time.
# These are build-time placeholders only — real values are injected at runtime via env_file.
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_SECRET=build-time-placeholder-replaced-at-runtime

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


# ── Production stage ───────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser  --system --uid 1001 appuser

# Copy built assets
COPY --from=builder /app/public ./public/
COPY --from=builder /app/.next ./.next/
COPY --from=builder /app/node_modules ./node_modules/
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

RUN chown -R appuser:appgroup /app/.next

USER appuser

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["npm", "start"]
