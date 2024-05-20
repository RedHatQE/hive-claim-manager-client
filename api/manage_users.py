from flask.cli import FlaskGroup
from pyaml_env import parse_config

from models import db, User
import os

from app import app, bcrypt


cli = FlaskGroup(app)


def create_users() -> None:
    _config = parse_config(os.environ["HIVE_CLAIM_FLASK_APP_USERS_FILE"])
    password = _config["password"]
    for user in _config["users"]:
        app.logger.info(f"Creating user {user}")
        hashed_password = bcrypt.generate_password_hash(password)
        new_user = User(name=user, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()


@cli.command("create_db")
def create_db() -> None:
    db.drop_all()
    db.create_all()
    create_users()
    db.session.commit()


if __name__ == "__main__":
    cli()
