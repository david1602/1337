FROM node:alpine

RUN apk update && \
  apk add git

ADD . /app

WORKDIR /app

RUN npm install

CMD ["node", "bot.js"]
