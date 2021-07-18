FROM node:16

WORKDIR /app
COPY . /app/

RUN npm install
RUN npm run build

RUN apt-get update || : && apt-get install python -y

CMD ["node", "build/main.js"]
