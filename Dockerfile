FROM node:19-alpine
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY ./ ./
RUN npm install --force --quiet
COPY --chown=node:node . .
EXPOSE 8080
CMD [ "backend-monitoramento-contabilizacao-folha", "server.ts" ]