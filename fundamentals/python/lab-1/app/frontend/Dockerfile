FROM node:14

# Create app directory
WORKDIR /usr/src/app

COPY ./client/package*.json ./

RUN npm install
COPY ./client .
RUN npm build
EXPOSE 3001

CMD [ "npm", "start" ]
