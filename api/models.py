from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

db = SQLAlchemy()


def get_uuid() -> str:
    return uuid4().hex


class User(db.Model):  # type: ignore[name-defined]
    __tablename__ = "users"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    name = db.Column(db.String(345), unique=True)
    password = db.Column(db.Text, nullable=False)
    admin = db.Column(db.Boolean, default=False)
