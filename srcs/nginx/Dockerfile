FROM nginx:latest

COPY default.conf /etc/nginx/conf.d/default.conf

RUN apt-get update && apt-get install -y openssl

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/transcendence.key \
    -out /etc/nginx/ssl/transcendence.crt \
    -subj "/CN=localhost"

RUN chmod 644 /etc/nginx/ssl/transcendence.crt
RUN chmod 600 /etc/nginx/ssl/transcendence.key

CMD ["nginx", "-g", "daemon off;"]