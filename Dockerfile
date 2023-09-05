FROM node:18-alpine AS app

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN apk --no-cache add curl

HEALTHCHECK --interval=10s --timeout=12s --start-period=10s \  
    CMD node healthcheck.js

CMD ["npm", "start"]