# ---- build stage ----
FROM node:20-alpine AS build
ARG CACHEBUST=1770143621
RUN echo "CACHEBUST=1770143621"
WORKDIR /app
RUN echo "BUILD_MARKER: ROOT_DOCKERFILE_USED" && node -v && npm -v
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production

# install only prod deps (serve is in dependencies now)
COPY package*.json ./
RUN npm ci --omit=dev \\
 && npm i -g serve@14.2.1 \\
 && command -v serve \\
 && serve --version
# copy build output
COPY --from=build /app/dist ./dist

# Railway provides PORT; npm start uses $PORT in script
EXPOSE 8080
CMD ["npm","start"]




