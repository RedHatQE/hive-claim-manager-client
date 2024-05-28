#!/bin/bash

set -ep

REDIS_DIR="/tmp/redis"

if [[ ! -d $REDIS_DIR ]]; then
	mkdir -p $REDIS_DIR
fi

redis-server redis.conf &
while ! redis-cli ping; do sleep 1; done
echo "Redis started"

pushd api/
poetry run python init_db.py create_db

if [[ -z $DEVELOPMENT ]]; then
	poetry run uwsgi --disable-logging --post-buffering --master --enable-threads --http 0.0.0.0:5000 --wsgi-file api.py --callable app --processes 4 --threads 2 &
else
	poetry run python api.py &
fi

while ! curl http://127.0.0.1:5000/api/healtcheck; do sleep 1; done
echo "API started"
popd

if [[ ! -f ".env" ]]; then
	echo "REACT_APP_API_URL=$REACT_APP_API_URL" >.env
fi

if [[ -z $DEVELOPMENT ]]; then
	serve -s build
else
	echo "REACT_APP_DEBUG=true" >>.env
	./node_modules/.bin/env-cmd -f .env npm run start-server
fi
