from ocp_resources.resource import List
from sqlalchemy import delete, insert, select

from models import db, DeletedClaim


class ClaimsDB:
    TABLE = DeletedClaim

    def get_deleted_claims(self) -> List[str]:
        with db.session() as _session:
            _claims = _session.scalars(select(self.TABLE)).all()
            return [claim.name for claim in _claims]

    def add_claim_to_deleted_claims(self, claim_name: str) -> None:
        with db.session() as _session:
            if not self.is_claim_in_db(claim_name=claim_name):
                insert(self.TABLE).values(name=claim_name)
                _session.commit()

    def remove_claim_from_deleted_claims(self, claim_name: str) -> None:
        with db.session() as _session:
            if self.is_claim_in_db(claim_name=claim_name):
                delete(self.TABLE).where(self.TABLE.name == claim_name)
                _session.commit()

    def is_claim_in_db(self, claim_name: str) -> bool:
        with db.session() as _session:
            return bool(_session.scalars(select(self.TABLE).where(self.TABLE.name == claim_name)).first())
