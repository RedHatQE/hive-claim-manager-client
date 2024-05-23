from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_session import Session
from ocp_resources.resource import get_client

from config import ApplicationConfig
from models import db


app = Flask("hive-claims-manager")
app.config.from_object(ApplicationConfig)
bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True)
Session(app)
db.init_app(app)

try:
    ocp_client = get_client()
except Exception as ex:
    app.logger.error(f"Failed to get hive ocp client: {ex}")
    exit(1)
