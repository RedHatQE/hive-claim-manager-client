# React client for [hive-cliam-manager-server](https://github.com/RedHatQE/hive-claim-manager-server)

UI for managing Openshift HIVE clusters pools.
Support:

- List all pools
- Claim cluster from pools
- Delete claims from pools
- Get cluster info (console URL, user/password and kubeconfig) from claimed cluster.

## pre-requisites
For local development:
- Install [redis](https://redis.io/)
- Run `npm install` from the repository root directory

## Usage

### Docker

```bash
docker build --build-arg REACT_APP_API_URL="http://localhost:5000/api" -t hive-claim-manager .
docker run --rm -it -p 3000:3000 -p 5000:5000 hive-claim-manager
```

### Docker compose

```yaml
services:
  hive-claim-manager:
    build:
      context: .
      args:
        - REACT_APP_API_URL=http://localhost:5000/api
        - DEVELOPMENT=true
    container_name: hive-claim-manager
    dns:
      - 8.8.8.8 # Opotional, added only if needed
    ports:
      - "3000:3000"
      - "5000:5000"
    volumes:
      - </path/to/kubeconfig>:/root/.kube/config
      - </path/to/credentials>:/root/.aws/credentials
      - </path/to/users.yaml>:/users.yaml
    environment:
      - HIVE_CLAIM_FLASK_APP_USERS_FILE=/users.yaml
      - HIVE_CLAIM_FLASK_APP_SECRET_KEY=<secret_key for flask>
      - HIVE_CLAIM_FLASK_APP_NAMESPACE=<hive namespace>
      - HIVE_CLAIM_FLASK_APP_DEBUG=true
      - HIVE_CLAIM_FLASK_APP_RELOAD=true
      - HIVE_CLAIM_MANAGER_SUPERUSER_NAME=<superuser name>
      - AWS_SHARED_CREDENTIALS_FILE=/root/.aws/credentials
      - KUBECONFIG=/root/.kube/config
```
