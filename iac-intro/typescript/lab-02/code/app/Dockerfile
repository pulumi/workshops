FROM node:12

WORKDIR /app

COPY *.json /app/
COPY index.ts /app/

RUN npm install && npm run env -- tsc
# use dumb-init so docker containers respect signals
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 && chmod +x /usr/local/bin/dumb-init

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD [ "node", "index.js" ]
