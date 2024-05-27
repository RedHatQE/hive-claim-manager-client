from __future__ import annotations

from typing import Any, Dict, List
from concurrent.futures import ThreadPoolExecutor, as_completed
from kubernetes.dynamic.resource import ResourceInstance
from ocp_resources.cluster_claim import ClusterClaim, NamespacedResource
from ocp_resources.cluster_pool import ClusterPool
from ocp_resources.cluster_deployment import ClusterDeployment
from ocp_resources.secret import Secret
from ocp_utilities.infra import base64
import os

import shortuuid

from app import app, ocp_client


HIVE_CLUSTER_NAMESPACE: str = os.environ["HIVE_CLAIM_FLASK_APP_NAMESPACE"]
CLAIMS_DELETE_IN_PROGRESS: List[str] = []


def get_all_claims() -> List[Dict[str, str]]:
    def _claims(_claim: NamespacedResource) -> List[Dict[str, str]]:
        if not _claim.exists:
            return []

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
            _info_dict = {"name": _name}
            with ThreadPoolExecutor() as _executor:
                _futures = []
                for _func in (
                    get_claimed_cluster_web_console,
                    get_claimed_cluster_kubeconfig,
                    get_claimed_cluster_creds,
                ):
                    _futures.append(_executor.submit(_func, _name))

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
            futures.append(executor.submit(_claims, claim))

        for future in as_completed(futures):
            if future.result():
                res.extend(future.result())

    _exists_claim = [_cl["name"] for _cl in res]
    for _delete_in_progress in CLAIMS_DELETE_IN_PROGRESS:
        if _delete_in_progress not in _exists_claim:
            CLAIMS_DELETE_IN_PROGRESS.remove(_delete_in_progress)

    # global CLAIMS_DELETE_IN_PROGRESS
    # CLAIMS_DELETE_IN_PROGRESS = list(set(CLAIMS_DELETE_IN_PROGRESS).intersection(set(_existing_claims)))
    # app.logger.info(f"Claims in progress: {CLAIMS_DELETE_IN_PROGRESS}")
    return res


def get_cluster_pools() -> List[Dict[str, str]]:
    res = []

    def _get_pool_info(pool: NamespacedResource) -> Dict[str, str]:
        _instance = pool.instance
        _name = _instance.metadata.name
        _size = _instance.spec.size
        _status = _instance.status
        _pool = {
            "name": _name,
            "size": _size,
            "claimed": get_num_cluster_pool_claims(pool_name=_name),
            "available": _status.size if _status else 0,
        }
        return _pool

    with ThreadPoolExecutor() as executor:
        futures = []
        for cp in ClusterPool.get(dyn_client=ocp_client, namespace=HIVE_CLUSTER_NAMESPACE):
            futures.append(executor.submit(_get_pool_info, cp))

        for future in as_completed(futures):
            res.append(future.result())

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
    CLAIMS_DELETE_IN_PROGRESS.append(claim_name)


def get_all_user_claims_names(user: str) -> List[str]:
    _user_claims: List[str] = []
    _claim: Any
    for _claim in ClusterClaim.get(dyn_client=ocp_client, namespace=HIVE_CLUSTER_NAMESPACE):
        if (
            user in _claim.name or user == os.getenv("HIVE_CLAIM_MANAGER_SUPERUSER_NAME")
        ) and _claim.name not in CLAIMS_DELETE_IN_PROGRESS:
            _user_claims.append(_claim.name)

    app.logger.info(f"User {user} claims: {_user_claims}")

    return _user_claims


def delete_all_claims(user: str) -> Dict[str, List[str]]:
    deleted_claims = []
    futures = []

    with ThreadPoolExecutor() as executor:
        for _claim in ClusterClaim.get(dyn_client=ocp_client, namespace=HIVE_CLUSTER_NAMESPACE):
            if user in _claim.name or user == os.getenv("HIVE_CLAIM_MANAGER_SUPERUSER_NAME"):
                futures.append(executor.submit(_claim.clean_up, False))
                deleted_claims.append(_claim.name)
                CLAIMS_DELETE_IN_PROGRESS.append(_claim.name)

    for _ in as_completed(futures):
        # clean_up does not return
        pass

    return {"deleted_claims": deleted_claims}


def get_claimed_cluster_deployment(claim_name: str) -> ClusterDeployment | str:
    _claim: Any = ClusterClaim(client=ocp_client, name=claim_name, namespace=HIVE_CLUSTER_NAMESPACE)
    _instance: ResourceInstance = _claim.instance
    if not _instance.spec.namespace:
        return "<p><b>ClusterDeployment not found for this claim</b></p>"

    return ClusterDeployment(client=ocp_client, name=_instance.spec.namespace, namespace=_instance.spec.namespace)


def get_claimed_cluster_web_console(claim_name: str) -> Dict[str, str]:
    _cluster_deployment = get_claimed_cluster_deployment(claim_name=claim_name)
    if isinstance(_cluster_deployment, str):
        return {"console": ""}

    _console_url = _cluster_deployment.instance.status.webConsoleURL
    return {"console": _console_url}


def get_claimed_cluster_creds(claim_name: str) -> Dict[str, str]:
    _cluster_deployment = get_claimed_cluster_deployment(claim_name=claim_name)
    if isinstance(_cluster_deployment, str):
        return {"creds": ""}

    _secret = Secret(
        name=_cluster_deployment.instance.spec.clusterMetadata.adminPasswordSecretRef.name,
        namespace=_cluster_deployment.namespace,
        client=ocp_client,
    )
    return {
        "creds": f"Username {base64.b64decode(_secret.instance.data.username).decode()}:Password {base64.b64decode(_secret.instance.data.password).decode()}"
    }


def get_claimed_cluster_kubeconfig(claim_name: str) -> Dict[str, str]:
    _cluster_deployment = get_claimed_cluster_deployment(claim_name=claim_name)
    if isinstance(_cluster_deployment, str):
        return {"kubeconfig": ""}

    _secret = Secret(
        name=_cluster_deployment.instance.spec.clusterMetadata.adminKubeconfigSecretRef.name,
        namespace=_cluster_deployment.namespace,
        client=ocp_client,
    )
    _kubeconfig_file_name = f"kubeconfig-{claim_name}"
    with open(f"/tmp/{_kubeconfig_file_name}", "w") as fd:
        fd.write(base64.b64decode(_secret.instance.data.kubeconfig).decode())

    return {"kubeconfig": f"/kubeconfig/{_kubeconfig_file_name}"}


def get_num_cluster_pool_claims(pool_name: str) -> int:
    num_claims = 0

    for _claim in ClusterClaim.get(dyn_client=ocp_client, namespace=HIVE_CLUSTER_NAMESPACE):
        if _claim.instance.spec.clusterPoolName == pool_name:
            num_claims += 1

    return num_claims
