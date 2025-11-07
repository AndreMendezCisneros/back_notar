import json
import os
import re

from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()


class PerplexityService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")

        if not api_key:
            raise ValueError("OPENAI_API_KEY no está configurada")

        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://api.perplexity.ai"
        )

    async def generate_nota(self, tema: str, contenido: str | None = None):
        contexto = (contenido or "").strip()
        contexto_texto = contexto if contexto else "Sin contexto adicional proporcionado."

        response = await self.client.chat.completions.create(
            model="sonar",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Eres un generador educativo IA. "
                        "Responde SOLAMENTE con un JSON válido que siga exactamente "
                        "este formato: {\"nota\": {\"titulo\": string, \"contenido\": string, \"resumen\": string, "
                        "\"puntos_clave\": [string,...]}, "
                        "\"cuestionarios\": [{\"titulo\": string, \"descripcion\": string, "
                        "\"preguntas\": [{\"tipo\": \"seleccion_multiple\" | \"falso_verdadero\", "
                        "\"contenido\": string, \"opciones\": [{\"contenido\": string, \"es_correcta\": boolean}, ...]}]}]}"
                    )
                },
                {
                    "role": "user",
                    "content": (
                        "Genera una nota completa sobre el siguiente tema y devuelve el JSON solicitado. "
                        f"Tema: {tema}. "
                        f"Contexto adicional: {contexto_texto} "
                        "Incluye al menos un cuestionario con 3 preguntas de selección múltiple."
                    )
                }
            ],
            temperature=0.7,
            max_tokens=2000
        )

        raw_content = (response.choices[0].message.content or "").strip()

        parsed = self._parse_json_response(raw_content)
        if parsed is None:
            raise ValueError("La IA no devolvió un JSON válido")

        nota = parsed.get("nota") or {}
        cuestionarios = parsed.get("cuestionarios") or []

        if not nota.get("contenido"):
            raise ValueError("La IA no generó contenido para la nota")

        return {
            "nota": {
                "titulo": nota.get("titulo"),
                "contenido": nota.get("contenido"),
                "resumen": nota.get("resumen"),
                "puntos_clave": nota.get("puntos_clave", [])
            },
            "cuestionarios": cuestionarios
        }

    @staticmethod
    def _parse_json_response(payload: str) -> dict | None:
        if not payload:
            return None

        candidates: list[str] = []

        stripped = payload.strip()
        if stripped.startswith('{'):
            candidates.append(stripped)

        code_blocks = re.findall(r"```(?:json)?\s*(\{.*?\})\s*```", payload, re.DOTALL)
        candidates.extend(code_blocks)

        if not candidates:
            inline_match = re.search(r"\{.*\}", payload, re.DOTALL)
            if inline_match:
                candidates.append(inline_match.group(0))

        for candidate in candidates:
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                continue

        return None

    async def summarize(self, texto: str):
        response = await self.client.chat.completions.create(
            model="sonar",
            messages=[
                {"role": "system", "content": "Resume el siguiente texto de forma concisa."},
                {"role": "user", "content": texto}
            ],
            temperature=0.5,
            max_tokens=500
        )

        return response.choices[0].message.content
