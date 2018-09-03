FROM node:carbon

WORKDIR /app/spotify-service
COPY spotify-service/ .
RUN npm i
RUN npm run build

WORKDIR /app
WORKDIR /app/server
COPY server/ .
RUN npm i
ENTRYPOINT ["yarn", "run" ,"start:prod"]
