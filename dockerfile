FROM node:22-alpine

WORKDIR /app

COPY package*.json yarn.lock ./

COPY prisma ./prisma

RUN yarn install --frozen-lockfile && yarn cache clean && npx prisma generate

COPY . .

RUN yarn build

EXPOSE 4000

CMD [ "yarn", "start:prod" ]
