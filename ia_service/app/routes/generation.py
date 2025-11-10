from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.perplexity_service import PerplexityService
import os

router = APIRouter()

# Lazy initialization del servicio
def get_perplexity_service():
    try:
        return PerplexityService()
    except ValueError as e:
        # Si no hay API key, el servicio no se puede inicializar
        # Pero permitimos que el endpoint funcione para recibir el error apropiado
        raise HTTPException(status_code=500, detail=str(e))

class GenerateRequest(BaseModel):
    tema: str
    contenido: str = ""
    prompt: str = None

class SummarizeRequest(BaseModel):
    texto: str

@router.post("/generate")
async def generate_nota(request: GenerateRequest):
    """Generar nota estructurada con Perplexity"""
    try:
        perplexity_service = get_perplexity_service()
        resultado = await perplexity_service.generate_nota(
            request.tema,
            request.contenido,
            request.prompt
        )
        return {
            "status": "success",
            "data": resultado
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize")
async def summarize_text(request: SummarizeRequest):
    """Resumir texto con Perplexity"""
    try:
        perplexity_service = get_perplexity_service()
        resumen = await perplexity_service.summarize(request.texto)
        return {
            "status": "success",
            "resumen": resumen
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
