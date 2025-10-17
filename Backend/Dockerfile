# Use Node.js base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package files first for caching
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend source code
COPY backend/ ./

# Build the app
RUN npm run build

# Expose NestJS default port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:dev"]
