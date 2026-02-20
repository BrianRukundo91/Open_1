FROM node:21-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

RUN npx vite build

RUN cp -r dist/public server/public

EXPOSE 3000

CMD ["npx", "tsx", "server/index.ts"]