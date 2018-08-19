FROM node:carbon

WORKDIR /app/spotify-service
COPY spotify-service/ .
RUN npm i

WORKDIR /app
RUN ls
WORKDIR /app/server
COPY server/ .
RUN npm i
ENTRYPOINT ["yarn", "start"]
