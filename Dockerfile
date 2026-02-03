# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production

# Install static server globally (no dependency ambiguity)
RUN npm i -g serve@14.2.5 && serve --version

# Copy build output
COPY --from=build /app/dist ./dist

# Railway injects PORT; fall back to 8080 for local runs
EXPOSE 8080
CMD ["sh","-lc","serve -s dist -l ${PORT:-8080}"]
