# Base image with scanner dependencies
FROM devintripp/deltaguard:1.0.2

WORKDIR /app

# Install deps first (leverage cache)
COPY package.json .
RUN npm install

# Copy the rest
COPY . .
# after COPY . . and npm ci/install
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build
# Build
RUN npm run build

# Expose and start
EXPOSE 3000
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
CMD ["./entrypoint.sh"]

