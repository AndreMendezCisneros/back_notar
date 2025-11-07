from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.perplexity_service import PerplexityService

router = APIRouter()
perplexity_service = PerplexityService()

class GenerateRequest(BaseModel):
    tema: str
    contenido: str

class SummarizeRequest(BaseModel):
    texto: str

@router.post("/generate")
async def generate_nota(request: GenerateRequest):
    """Generar nota estructurada con Perplexity"""
    try:
        resultado = await perplexity_service.generate_nota(
            request.tema,
            request.contenido
        )
        return {
            "status": "success",
            "data": resultado
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize")
async def summarize_text(request: SummarizeRequest):
    """Resumir texto con Perplexity"""
    try:
        resumen = await perplexity_service.summarize(request.texto)
        return {
            "status": "success",
            "resumen": resumen
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
