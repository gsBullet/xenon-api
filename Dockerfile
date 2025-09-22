FROM node:12.20.2

RUN mkdir -p /home/durbinlms/app/node_modules && chown -R node:node /home/durbinlms/app

WORKDIR /home/durbinlms/app

COPY package*.json ./

USER node

COPY --chown=node:node . .

RUN npm install

EXPOSE 3141

CMD [ "node", "server/app.js" ]