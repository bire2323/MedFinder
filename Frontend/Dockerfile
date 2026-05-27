FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build production app
RUN npm run build

# Install static server
RUN npm install -g serve

# Render provides PORT dynamically
ENV PORT=10000

EXPOSE $PORT

CMD ["sh", "-c", "serve -s dist -l $PORT"]