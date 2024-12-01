FROM node:22.11

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY frontend-admin/package*.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY frontend-admin/ ./

# Expose the frontend port
EXPOSE 5001

# Start the frontend server
CMD ["npm", "run-script", "dev"]