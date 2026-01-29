from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.db.session import Base

class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String)
    content = Column(Text)
    provider = Column(String)
    model = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
