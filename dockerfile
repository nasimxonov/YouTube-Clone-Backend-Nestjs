FROM node:22-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean
COPY . .
RUN npx prisma generate
RUN yarn build
RUN yarn install --frozen-lockfile --production && yarn cache clean
EXPOSE 4000