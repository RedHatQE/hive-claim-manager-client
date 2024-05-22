from flask.cli import FlaskGroup
from pyaml_env import parse_config

from models import db, User
import os

from app import app, bcrypt


cli = FlaskGroup(app)


def create_users() -> None:
    for user_data in parse_config(os.environ["HIVE_CLAIM_FLASK_APP_USERS_FILE"])["users"]:
        username, password = user_data.split(":")
        app.logger.info(f"Creating user {username}")
        hashed_password = bcrypt.generate_password_hash(password)
        new_user = User(
            name=username,
            password=hashed_password,
            admin=os.getenv("HIVE_CLAIM_MANAGER_SUPERUSER_NAME") == username,
        )
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
