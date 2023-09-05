FROM node:18-alpine AS app

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN apk --no-cache add curl

HEALTHCHECK CMD curl --fail http://localhost:8080/healthcheck || exit 1   

CMD ["npm", "start"]