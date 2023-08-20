FROM node:18-slim AS app

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]