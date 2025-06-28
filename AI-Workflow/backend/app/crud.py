from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_workflows(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Workflow)
        .filter(models.Workflow.owner_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_workflow(db: Session, workflow_id: int, user_id: int):
    return (
        db.query(models.Workflow)
        .filter(models.Workflow.id == workflow_id, models.Workflow.owner_id == user_id)
        .first()
    )

def create_workflow(db: Session, workflow: schemas.WorkflowCreate, user_id: int):
    db_workflow = models.Workflow(
        **workflow.dict(),
        nodes={},
        edges={},
        owner_id=user_id
    )
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

def update_workflow(db: Session, workflow_id: int, workflow_update: dict, user_id: int):
    db_workflow = get_workflow(db, workflow_id, user_id)
    if db_workflow:
        for key, value in workflow_update.items():
            setattr(db_workflow, key, value)
        db.commit()
        db.refresh(db_workflow)
    return db_workflow

def delete_workflow(db: Session, workflow_id: int, user_id: int):
    db_workflow = get_workflow(db, workflow_id, user_id)
    if db_workflow:
        db.delete(db_workflow)
        db.commit()
    return db_workflow