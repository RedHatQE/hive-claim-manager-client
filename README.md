# React client for <a href="https://github.com/RedHatQE/hive-claim-manager" target="_blank">Hive Claim Manager</a>

UI for managing Openshift HIVE clusters pools.
Support:

- List all pools
- Claim cluster from pools
- Delete claims from pools
- Get cluster info (console URL, user/password and kubeconfig) from claimed cluster.

## Usage

### Local Development

Edit [docker-compose.example.yaml](docker-compose.example.yaml)

Run `docker compose -f .local/docker-compose.yaml up --watch --build`

Open <a href="http://localhost" target="_blank">localhost</a> in browser, login with `admin` (superuser) or `dev` (password `dev`)

Node server and Flask server will be automatically reloaded on file changes.
