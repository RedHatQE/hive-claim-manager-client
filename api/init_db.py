from flask.cli import FlaskGroup

from users_db import UsersDB
from models import db

from app import app

cli = FlaskGroup(app)


@cli.command("create_db")
def create_db() -> None:
    UsersDB().delete_table()
    db.create_all()
    UsersDB().create_users()
    db.session.commit()


if __name__ == "__main__":
    cli()
