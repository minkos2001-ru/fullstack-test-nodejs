FROM node:24.21.0-alpine AS builder

WORKDIR /app

ARG SERVER_PROTOCOL
ARG SERVER_HOST
ARG SERVER_PORT

ENV SERVER_PROTOCOL=$SERVER_PROTOCOL
ENV SERVER_HOST=$SERVER_HOST
ENV SERVER_PORT=$SERVER_PORT

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80