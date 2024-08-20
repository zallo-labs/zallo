ARG REDIS_VERSION=7.4.0
FROM redis:${REDIS_VERSION}

COPY start-redis-server.sh /usr/bin/start-redis-server.sh

CMD ["/usr/bin/start-redis-server.sh"]