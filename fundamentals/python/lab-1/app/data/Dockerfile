FROM mongo:focal

ENV MONGO_INITDB_DATABASE=cart

COPY data.js /docker-entrypoint-initdb.d/mongo-init.js
COPY docker-healthcheck.sh /usr/local/bin

RUN chmod +x /usr/local/bin/docker-healthcheck.sh

HEALTHCHECK CMD ["/usr/local/bin/docker-healthcheck.sh"]

ENTRYPOINT ["docker-entrypoint.sh"]

EXPOSE 27017
CMD ["mongod"]