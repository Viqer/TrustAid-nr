FROM node:20-alpine

WORKDIR /app/frontend

COPY client/package*.json ./
RUN npm install

COPY client/ .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]