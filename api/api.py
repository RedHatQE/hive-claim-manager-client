import os
from typing import Any, Tuple
from flask import Response, request, send_file
from flask import jsonify, session
from models import db, User
from pyaml_env import parse_config
from app import app
from utils import (
    claim_cluster,
    claim_cluster_delete,
    delete_all_claims,
    get_all_claims,
    get_all_user_claims_names,
    get_cluster_pools,
)
from app import bcrypt


def create_users() -> None:
    _config = parse_config(os.environ["HIVE_CLAIM_FLASK_APP_USERS_FILE"])
    password = _config["password"]
    for user in _config["users"]:
        app.logger.info(f"Creating user {user}")
        hashed_password = bcrypt.generate_password_hash(password)
        new_user = User(name=user, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()


# with app.app_context():
#     db.drop_all()
#     db.session.commit()
#     db.create_all()
#     create_users()
#     db.session.commit()


@app.route("/api/healthcheck")
def healthcheck() -> Tuple[Response, int]:
    return jsonify({"status": "ok"}), 200


@app.route("/api/@me")
def get_current_user() -> Tuple[Response, int]:
    _error = {"error": "Unauthorized", "id": "", "name": ""}
    user_id = session.get("user_id")

    if not user_id:
        app.logger.info("no USER ID")
        return jsonify(_error), 401

    user: Any = User.query.filter_by(id=user_id).first()

    if not user:
        app.logger.info("no USER")
        return jsonify(_error), 401

    return jsonify({"id": user.id, "name": user.name, "error": ""}), 200


@app.route("/api/login", methods=["POST"])
def login_user() -> Tuple[Response, int]:
    name = request.json["name"]
    password = request.json["password"]

    user: Any = User.query.filter_by(name=name).first()

    if user is None:
        return jsonify({"error": "Unauthorized"}), 401

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Unauthorized"}), 401

    session["user_id"] = user.id

    return jsonify({"id": user.id, "name": user.name}), 200


@app.route("/api/logout", methods=["POST"])
def logout_user() -> Tuple[Response, int]:
    session.pop("user_id")
    return jsonify({"status": "ok"}), 200


@app.route("/api/cluster-pools", methods=["GET"])
def cluster_pools_endpoint() -> Tuple[Response, int]:
    return jsonify(get_cluster_pools()), 200


@app.route("/api/cluster-claims", methods=["GET"])
def cluster_claims_endpoint() -> Tuple[Response, int]:
    return jsonify(get_all_claims()), 200


@app.route("/api/claim-cluster", methods=["POST"])
def claim_cluster_endpoint() -> Tuple[Response, int]:
    _user: str = request.args.get("user", "")
    _pool_name: str = request.args.get("name", "")
    if not _user or not _pool_name:
        return jsonify({"error": "User or Pool name missing", "name": ""}), 401

    return jsonify(claim_cluster(user=_user, pool=_pool_name)), 200


@app.route("/api/delete-claim", methods=["POST"])
def delete_claim_endpoint() -> Tuple[Response, int]:
    _claim_name: str = request.args.get("name", "")
    _user: str = request.args.get("user", "")
    if _user not in _claim_name:
        return jsonify({"error": "User is not allowed to delete this claim", "name": ""}), 401

    claim_cluster_delete(claim_name=_claim_name.strip())
    return jsonify({"deleted": _claim_name}), 200


@app.route("/api/all-user-claims-names", methods=["GET"])
def all_user_claims_names_endpoint() -> Tuple[Response, int]:
    _user: str = request.args.get("user", "")
    return jsonify(get_all_user_claims_names(user=_user)), 200


@app.route("/api/delete-all-claims", methods=["POST"])
def delete_all_claims_endpoint() -> Tuple[Response, int]:
    _user: str = request.args.get("user", "")
    return jsonify(delete_all_claims(user=_user)), 200


@app.route("/api/kubeconfig/<filename>", methods=["GET"])
def download_kubeconfig_endpoint(filename: str) -> Response:
    return send_file(f"/tmp/{filename}", download_name=filename, as_attachment=True)  # type: ignore[call-arg]


def main() -> None:
    app.logger.info(f"Starting {app.name} app")

    app.run(
        port=5000,
        host="0.0.0.0",
        use_reloader=bool(os.getenv("HIVE_CLAIM_FLASK_APP_RELOAD", False)),
        debug=bool(os.getenv("HIVE_CLAIM_FLASK_APP_DEBUG", False)),
    )


if __name__ == "__main__":
    main()
