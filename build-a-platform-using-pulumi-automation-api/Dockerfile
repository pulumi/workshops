FROM cgr.dev/chainguard/node:latest-dev

USER root
RUN apk update && apk add \
    cairo-dev libjpeg-turbo-dev pango-dev giflib-dev \
    librsvg-dev glib-dev harfbuzz-dev fribidi-dev expat-dev libxft-dev

#Create non-root user
RUN addgroup pulumi && adduser -D -G pulumi pulumi
RUN install -d -o pulumi -g pulumi /home/pulumi

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install
COPY ./src /usr/src/app

RUN chown -R pulumi:pulumi /usr/src/app
USER pulumi

ENV PORT=8080

EXPOSE 8080

ENTRYPOINT [ "npm", "start" ]
