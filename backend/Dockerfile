FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src
COPY data ./data

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "run", "start"]
