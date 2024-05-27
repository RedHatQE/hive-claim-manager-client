from ocp_resources.resource import List
from models import db, DeletedClaim


def get_deleted_claims() -> List[str]:
    _claims = DeletedClaim.query.all()
    return [claim.name for claim in _claims]


def add_claim_to_deleted_claims(claim_name: str) -> None:
    with db.session() as _session:
        if not DeletedClaim.query.filter_by(name=claim_name).first():
            _session.add(DeletedClaim(name=claim_name))
            _session.commit()


def remove_claim_from_deleted_claims(claim_name: str) -> None:
    with db.session() as _session:
        if DeletedClaim.query.filter_by(name=claim_name).first():
            _session.query(DeletedClaim).filter_by(name=claim_name).delete()
            _session.commit()
