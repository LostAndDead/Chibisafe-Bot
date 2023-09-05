FROM node:18-slim AS app

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

HEALTHCHECK CMD curl --fail http://localhost:8080/healthcheck || exit 1   

CMD ["npm", "start"]