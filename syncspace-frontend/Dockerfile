# Stage 1: Build React/TypeScript application with Node
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency definition
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Copy application source
COPY . .

# Build application
RUN npm run build

# Stage 2: Serve application with lightweight Nginx
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built artifacts from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing and reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
