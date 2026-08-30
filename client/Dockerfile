# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install development and production dependencies
RUN npm ci

# Copy client source code
COPY . .

# Build application assets
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine

# Copy built files from the build stage to Nginx serve folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
