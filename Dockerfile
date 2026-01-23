# Use Node 22 as requested
FROM node:22.16.0-slim

WORKDIR /app

# 1. Copy everything from your ThinkPad root to the container /app
COPY . .

# 2. Build the Frontend
# We enter the client folder, install, and build the 'dist' folder
RUN cd client && npm install && npm run build

# 3. Setup the Backend
# We enter the server folder and install dependencies
RUN cd server && npm install

# 4. Expose the port (must match your server.js port)
EXPOSE 5000

# 5. Start the server
# We run the node command from the root, pointing to the server file
CMD ["node", "server/server.js"]