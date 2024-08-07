FROM node:22.6.0-alpine
WORKDIR /app
RUN apk update && apk add busybox-extras
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]