FROM node:22-alpine

# Install postgresql-client to provide the pg_isready tool
RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compile TypeScript source
RUN npm run build

# Make sure entrypoint script is executable
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
