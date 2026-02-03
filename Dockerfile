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

# install only prod deps (serve is in dependencies now)
COPY package*.json ./
RUN npm ci --omit=dev

# copy build output
COPY --from=build /app/dist ./dist

# Railway provides PORT; npm start uses $PORT in script
EXPOSE 8080
CMD ["npm","start"]
