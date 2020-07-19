FROM node:13.12.0
WORKDIR '/app'
COPY . .
RUN npm ci
RUN tsc --traceResolution
CMD npm start