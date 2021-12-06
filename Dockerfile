FROM node:12

WORKDIR /app

COPY package.json ./
RUN npm cache clean --force
RUN npm install

COPY . .

COPY ./entrypoint.sh /entrypoint.sh

RUN chmod +x ./entrypoint.sh
RUN chmod +x ./wait-for-it.sh

ENTRYPOINT ["/entrypoint.sh"]

CMD ["npm", "run" ,"watch"]
