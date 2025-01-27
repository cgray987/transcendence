FROM nginx:latest

COPY default.conf /etc/nginx/conf.d/default.conf

RUN apt-get install -y openssl

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -out /etc/nginx/ssl/transcendence.crt -keyout /etc/nginx/ssl/transcendence.key -subj "/CN=localhost"

CMD ["nginx", "-g", "daemon off;"]