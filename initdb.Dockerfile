FROM alpine:latest

WORKDIR app

# Download https://github.com/golang-migrate/migrate/tree/master/cmd/migrate
RUN apk add --update \
  curl \
  && rm -rf /var/cache/apk/*

RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.5.0/migrate.linux-amd64.tar.gz | tar xvz

# Copy migrations from server/
COPY ./server/migrations migrations/

# Run migrations on postgres service
CMD ./migrate.linux-amd64 -path ./migrations -database 'postgres://postgres:postgres@postgres?sslmode=disable' up
