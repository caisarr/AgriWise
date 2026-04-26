from fastapi import APIRouter
from app.models.schemas import ChatRequest
from app.services.ai_service import stream_chat

router = APIRouter(prefix="/api", tags=["chat"])

@router.post("/chat")
async def chat(body: ChatRequest):
    messages = [{"role": m.role, "content": m.content} for m in body.messages]
    reply    = await stream_chat(messages, context=body.context or "")
    return {"reply": reply}
