FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Accept build arguments for environment variables (these are public URLs, not secrets)
# hadolint ignore=DL3006
ARG VITE_BACKEND_URL
ARG VITE_AUTH_URL

# Set them as environment variables for the build
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_AUTH_URL=$VITE_AUTH_URL

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
