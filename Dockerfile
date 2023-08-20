FROM node:slim AS app

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]