FROM node:13.12.0
WORKDIR '/app'
COPY . .
RUN npm ci
CMD npm start