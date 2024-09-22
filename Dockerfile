
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

RUN npm install --only=production

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "run", "start"]