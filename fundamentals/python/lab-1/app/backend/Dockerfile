FROM node:14

# Create app directory
WORKDIR /usr/src/app

COPY ./src/package*.json ./

RUN npm install
COPY ./src .
RUN npm build
EXPOSE 3000

CMD [ "npm", "start" ]