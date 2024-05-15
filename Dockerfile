FROM node:22.1.0-alpine

EXPOSE 3000
RUN apk add --no-cache curl

WORKDIR /hive-claim-system-client
COPY . .
RUN npm config set cache /tmp --global

HEALTHCHECK CMD curl --fail http://127.0.0.1:3000 || exit 1
CMD ["npm", "start"]
