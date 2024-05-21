# React client for <a href="https://github.com/RedHatQE/hive-claim-manager" target="_blank">Hive Claim Manager</a>

UI for managing Openshift HIVE clusters pools.
Support:

- List all pools
- Claim cluster from pools
- Delete claims from pools
- Get cluster info (console URL, user/password and kubeconfig) from claimed cluster.

## Usage

### Docker compose

Edit [docker-compose.example.yaml](docker-compose.example.yaml)

Run `docker compose -f .local/docker-compose.yaml up --watch --build`

Open <a href="http://localhost" target="_blank">localhost</a> in browser, login with `admin` (superuser) or `dev` (password `dev`)
