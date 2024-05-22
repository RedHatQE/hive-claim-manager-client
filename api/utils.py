from __future__ import annotations

import logging
from typing import Any, Dict, List
from concurrent.futures import ThreadPoolExecutor, as_completed
from kubernetes.dynamic.resource import ResourceInstance
from ocp_resources.cluster_claim import ClusterClaim, NamespacedResource
from ocp_resources.cluster_pool import ClusterPool
from ocp_resources.cluster_deployment import ClusterDeployment
from ocp_resources.secret import Secret
from ocp_utilities.infra import DynamicClient, base64
import os

import shortuuid

from api.app import ocp_client

HIVE_CLUSTER_NAMESPACE = os.environ["HIVE_CLAIM_FLASK_APP_NAMESPACE"]


def get_all_claims() -> List[Dict[str, str]]:
    def _claims(_claim: NamespacedResource, _dyn_client: DynamicClient) -> List[Dict[str, str]]:
        _res = []
        _instance = _claim.instance
        _namespace = _instance.spec.namespace
        _name = _instance.metadata.name
        _cluster_info = {
            "name": _name,
            "namespace": _namespace or "Not Ready",
            "pool": _instance.spec.clusterPoolName,
            "info": [],
        }
        if _namespace:
            _info_dict = {"name": _instance.metadata.name}
            with ThreadPoolExecutor() as _executor:
                _futures = []
                for _func in (
                    get_claimed_cluster_web_console,
                    get_claimed_cluster_kubeconfig,
                    get_claimed_cluster_creds,
                ):
                    _futures.append(_executor.submit(_func, _name, _dyn_client))

                for _future in as_completed(_futures):
                    _info_dict.update(_future.result())

        else:
            _info_dict = {
                "console": "Not Ready",
                "kubeconfig": "Not Ready",
                "creds": "Not Ready",
                "name": _name,
            }

        _cluster_info["info"].append(_info_dict)

        _res.append(_cluster_info)
        return _res

    with ThreadPoolExecutor() as executor:
        futures = []
        res = []
        for claim in ClusterClaim.get(dyn_client=ocp_client, namespace=HIVE_CLUSTER_NAMESPACE):
            futures.append(executor.submit(_claims, claim, ocp_client))

        for future in as_completed(futures):
            res.extend(future.result())
    return res


def get_cluster_pools() -> List[Dict[str, str]]:
    res = []
    for cp in ClusterPool.get(dyn_client=ocp_client, namespace=HIVE_CLUSTER_NAMESPACE):
        _instance: ResourceInstance = cp.instance
        _name = _instance.metadata.name
        _size = _instance.spec.size
        _status = _instance.status
        _claimed_clusters = len(get_cluster_pool_claims(dyn_client=ocp_client, pool_name=_name))
        _pool = {
            "name": _name,
            "size": _size,
            "claimed": _size - _claimed_clusters,
            "available": _status.size if _status else 0,
        }
        res.append(_pool)

    return res


def claim_cluster(user: str, pool: str) -> Dict[str, str]:
    res: Dict[str, str] = {"error": "", "name": ""}
    _claim: Any = ClusterClaim(
        name=f"{user}-{shortuuid.uuid()[0:5].lower()}",
        namespace=HIVE_CLUSTER_NAMESPACE,
        cluster_pool_name=pool,
    )
    try:
        _claim.deploy()
    except Exception as exp:
        res["error"] = exp.summary()  # type: ignore[attr-defined]
    res["name"] = _claim.name
    return res


def claim_cluster_delete(claim_name: str) -> None:
    if not claim_name:
        return

    _claim = ClusterClaim(
        name=claim_name,
        namespace=HIVE_CLUSTER_NAMESPACE,
    )
    _claim.clean_up(wait=False)


def get_all_user_claims_names(user: str, logger: logging.Logger) -> List[str]:
    _user_claims: List[str] = []
    _claim: Any
    for _claim in ClusterClaim.get(dyn_client=ocp_client, namespace=HIVE_CLUSTER_NAMESPACE):
        logger.info(f"User: {user} claim {_claim.name}")
        if user in _claim.name or user == os.getenv("HIVE_CLAIM_MANAGER_SUPERUSER_NAME"):
            _user_claims.append(_claim.name)

    logger.info(f"User {user} claims: {_user_claims}")

    return _user_claims


def delete_all_claims(user: str) -> Dict[str, List[str]]:
    deleted_claims = []
    futures = []

    with ThreadPoolExecutor() as executor:
        for _claim in ClusterClaim.get(dyn_client=ocp_client, namespace=HIVE_CLUSTER_NAMESPACE):
            if user in _claim.name or user == os.getenv("HIVE_CLAIM_MANAGER_SUPERUSER_NAME"):
                futures.append(executor.submit(_claim.clean_up, False))
                deleted_claims.append(_claim.name)

    for _ in as_completed(futures):
        # clean_up does not return
        pass

    return {"deleted_claims": deleted_claims}


def get_claimed_cluster_deployment(claim_name: str, dyn_client: DynamicClient) -> ClusterDeployment | str:
    _claim: Any = ClusterClaim(client=dyn_client, name=claim_name, namespace=HIVE_CLUSTER_NAMESPACE)
    _instance: ResourceInstance = _claim.instance
    if not _instance.spec.namespace:
        return "<p><b>ClusterDeployment not found for this claim</b></p>"

    return ClusterDeployment(client=dyn_client, name=_instance.spec.namespace, namespace=_instance.spec.namespace)


def get_claimed_cluster_web_console(claim_name: str, dyn_client: DynamicClient) -> Dict[str, str]:
    _cluster_deployment = get_claimed_cluster_deployment(claim_name=claim_name, dyn_client=dyn_client)
    if isinstance(_cluster_deployment, str):
        return {"console": ""}

    _console_url = _cluster_deployment.instance.status.webConsoleURL
    return {"console": _console_url}


def get_claimed_cluster_creds(claim_name: str, dyn_client: DynamicClient) -> Dict[str, str]:
    _cluster_deployment = get_claimed_cluster_deployment(claim_name=claim_name, dyn_client=dyn_client)
    if isinstance(_cluster_deployment, str):
        return {"creds": ""}

    _secret = Secret(
        name=_cluster_deployment.instance.spec.clusterMetadata.adminPasswordSecretRef.name,
        namespace=_cluster_deployment.namespace,
        client=dyn_client,
    )
    return {"creds": f"Username {_secret.instance.data.username}:Password {_secret.instance.data.password}"}


def get_claimed_cluster_kubeconfig(claim_name: str, dyn_client: DynamicClient) -> Dict[str, str]:
    _cluster_deployment = get_claimed_cluster_deployment(claim_name=claim_name, dyn_client=dyn_client)
    if isinstance(_cluster_deployment, str):
        return {"kubeconfig": ""}

    _secret = Secret(
        name=_cluster_deployment.instance.spec.clusterMetadata.adminKubeconfigSecretRef.name,
        namespace=_cluster_deployment.namespace,
        client=dyn_client,
    )
    _kubeconfig_file_name = f"kubeconfig-{claim_name}"
    with open(f"/tmp/{_kubeconfig_file_name}", "w") as fd:
        fd.write(base64.b64decode(_secret.instance.data.kubeconfig).decode())

    return {"kubeconfig": f"/kubeconfig/{_kubeconfig_file_name}"}


def get_cluster_pool_claims(pool_name: str, dyn_client: DynamicClient) -> List[str]:
    _claims: List[str] = []

    for _claim in ClusterClaim.get(dyn_client=dyn_client, namespace=HIVE_CLUSTER_NAMESPACE):
        if _claim.instance.spec.clusterPoolRef.name == pool_name:
            _claims.append(_claim.name)

    return _claims
