# Dockerfile — a trivial "hello" web server, just enough to have something
# real to sign, push, and admit or reject.
FROM python:3.13-alpine

WORKDIR /app
COPY server.py .

EXPOSE 8080
CMD ["python3", "server.py"]
