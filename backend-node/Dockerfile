FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
# Cloud Run sets the PORT env var automatically
CMD ["node", "index.js"]