# React client for <a href="https://github.com/RedHatQE/hive-claim-manager" target="_blank">Hive Claim Manager</a>

UI for managing Openshift HIVE clusters pools.
Support:

- List all pools
- Claim cluster from pools
- Delete claims from pools
- Get cluster info (console URL, user/password and kubeconfig) from claimed cluster.

### Local Development

Required docker compose version >= 2.22.0

Edit [docker-compose.example.yaml](docker-compose.example.yaml)

Create docker network, if it does not exist:

```bash
docker network ls
docker network create hive-claim-manager
```

Run `docker compose -f .local/docker-compose.yaml up --watch --build`

Open <a href="http://localhost" target="_blank">localhost</a> in browser

The following users configured:

- User: `admin` Password: `admin` # Superuser, can delete other users claims <!--pragma: allowlist secret-->
- User: `dev` Password: `dev` <!--pragma: allowlist secret-->
- User: `user` Password: `user` <!--pragma: allowlist secret-->

Node server and Flask server will be automatically reloaded on file changes.
