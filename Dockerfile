# Base image with scanner dependencies
FROM devintripp/deltaguard:1.0.2

WORKDIR /app

# Install deps first (leverage cache)
COPY package.json .
RUN npm install

# Copy the rest
COPY . .

# Build
RUN npm run build

# Expose and start
EXPOSE 3000
CMD ["npm", "run", "start"]
