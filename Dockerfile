FROM node:22.1.0-alpine

WORKDIR /hive-claim-system-client
COPY . .
RUN npm config set cache /tmp --global \
  && npm install -g serve \
  && npm run build

HEALTHCHECK CMD curl --fail http://127.0.0.1:3000 || exit 1
CMD ["serve", "-s", "build"]
