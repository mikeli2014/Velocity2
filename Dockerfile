# --- Build stage ----------------------------------------------------------
# Build the Vite + React app inside a Node image so we don't need any
# tooling in the final container.
FROM node:20-alpine AS build
WORKDIR /app

# Install deps with a clean, lockfile-driven install for reproducibility.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy the rest and produce static assets in /app/dist
COPY . .
RUN npm run build

# --- Serve stage ----------------------------------------------------------
# Serve the static bundle with Nginx. Cloud Run / Cloud Build standard port
# is 8080; the SPA fallback is handled in nginx.conf.
FROM nginx:1.27-alpine AS serve

# Drop the default config so ours fully owns server{}.
RUN rm /etc/nginx/conf.d/default.conf

# Static assets + SPA-aware Nginx config.
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
