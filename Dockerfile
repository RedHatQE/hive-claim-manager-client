FROM quay.io/redhat_msi/qe-tools-base-image:latest

EXPOSE 3000
EXPOSE 5000
ARG REACT_APP_API_URL
ARG DEVELOPMENT

RUN apt-get update \
  && apt-get install -y redis npm nodejs --no-install-recommends \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

ENV APP_DIR=/hive-claim-manager
ENV POETRY_HOME=$APP_DIR
ENV PATH="$APP_DIR/bin:$PATH"

RUN npm config set cache /tmp --global \
  && npm install -g serve

RUN mkdir -p /tmp/redis && chmod 777 /tmp/redis

COPY . $APP_DIR/

WORKDIR $APP_DIR

RUN python3 -m pip install --no-cache-dir --upgrade pip --upgrade \
  && python3 -m pip install --no-cache-dir poetry \
  && poetry config cache-dir $APP_DIR \
  && poetry config virtualenvs.in-project true \
  && poetry config installer.max-workers 10 \
  && poetry install


RUN echo "REACT_APP_API_URL=$REACT_APP_API_URL" > .env
RUN npm install
RUN if [ -z "$DEVELOPMENT" ]; \
  then \
  ./node_modules/.bin/env-cmd -f .env npm run build; \
  fi

HEALTHCHECK CMD curl --fail http://127.0.0.1:3000 || exit 1
ENTRYPOINT ["./entrypoint.sh"]
