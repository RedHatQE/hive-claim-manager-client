FROM node:22.1.0-alpine

WORKDIR /hove-claim-system-client
COPY . .
RUN npm install
CMD ["npm", "start"]
