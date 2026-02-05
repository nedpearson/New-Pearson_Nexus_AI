# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci
COPY . .
RUN npm -w apps/web run build

# ---- runtime stage ----
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production

# Install runtime dependencies (Express server + shared deps)
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci --omit=dev

# Copy build output + server script
COPY --from=build /app/apps/web/dist ./apps/web/dist
COPY apps/web/scripts ./apps/web/scripts
COPY apps/web/server ./apps/web/server

# Railway injects PORT; fall back to 8080 for local runs
EXPOSE 8080
CMD ["node","apps/web/scripts/start.mjs"]
