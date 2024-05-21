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

### Docker compose

Edit [docker-compose.example.yaml](docker-compose.example.yaml)
Run `docker compose -f .local/docker-compose.yaml up --watch --build`
Open [localhost](http://localhost) in browser
