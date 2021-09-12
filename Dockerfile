# Build container
FROM node:16-alpine3.12
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY .yarn          ./.yarn
COPY .yarnrc.yml    ./
COPY package.json   ./
COPY yarn.lock      ./

RUN yarn --immutable --inline-builds

COPY . ./

CMD ["node", "index.js"]
