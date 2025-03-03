#npm run build && docker-compose down && docker-compose up -d --build
# Stage 1
FROM node:20 as node

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Stage 2
FROM nginx:1.13.12-alpine

COPY --from=node /usr/src/app/dist/ti-monitoramento-folha-contabilizacao-frontend/browser /usr/share/nginx/html

#COPY ./deploy/monitorserasa.totvs.com.cer /etc/ssl/monitorserasa.totvs.com.cer
#COPY ./deploy/monitorserasa.totvs.com.key /etc/ssl/monitorserasa.totvs.com.key

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
