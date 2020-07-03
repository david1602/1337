FROM ubuntu

RUN apt-get update -y && apt-get upgrade -y

RUN apt-get install -y curl git libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs

RUN npm install node-gyp -g

ADD . /app

WORKDIR /app

RUN npm install

WORKDIR /app/node_modules/canvas

RUN node-gyp rebuild

WORKDIR /app

CMD ["npm", "run", "start"]
