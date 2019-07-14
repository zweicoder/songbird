FROM node:carbon

WORKDIR /app/spotify-service
COPY spotify-service/ .
RUN npm i
RUN npm run build

WORKDIR /app/client
COPY client/ .
RUN npm i
ENTRYPOINT ["npm", "start"]
