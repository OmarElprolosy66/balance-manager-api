FROM node:22-alpine

# Install postgresql-client to provide the pg_isready tool
RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compile TypeScript source
RUN npm run build

# Convert Windows line endings (CRLF) to Unix line endings (LF) and make the script executable
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
