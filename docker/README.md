# voicybot

## Source

https://github.com/backmeupplz/voicy

## Usage

```
docker build -t alexeym/lehabot-node .
docker create --name=voicybot  -e PUID=1000 -e PGID=1000  -v /config:/config --restart always  alexeym/lehabot-node
```

## Configuration

Put your .env file in /config/voicybot/.env. A sample can be seen at https://github.com/backmeupplz/voicy/blob/master/.env.sample

## Other
- workavournd for *error npmlog@6.0.0: The engine "node" is incompatible with this module* 
yarn install --ignore-engines true

build base image:
docker build -t alexey/lehabot -f docker/Dockerfile-base .

- run project
docker compose -f docker/docker-compose.yml up

- install packages
docker compose -f docker-compose.dev-builder.yml up
