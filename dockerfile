FROM node:alpine

RUN apk update && \
    apk add git

RUN git clone https://github.com/david1602/1337.git /app

ADD . /app/config.js

WORKDIR /app

RUN npm install

WORKDIR /
CMD ["node", "/app/bot.js"]
