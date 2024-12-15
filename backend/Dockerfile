FROM node:22.11

# Working Directory
WORKDIR /app

# Copy package.json and install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy the rest of the backend source code
COPY backend/ ./

# Expose backend port
EXPOSE 3001

# Start the backend server
CMD ["npm", "run", "start"]