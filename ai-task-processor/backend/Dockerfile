FROM node:18-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

COPY . .

FROM node:18-alpine

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app ./

# Use non-root user
USER node

EXPOSE 5000
CMD ["node", "index.js"]
