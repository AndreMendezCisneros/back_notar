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

    async def generate_nota(self, tema: str, contenido: str | None = None, prompt: str | None = None):
        contexto = (contenido or "").strip()
        contexto_texto = contexto if contexto else "Sin contexto adicional proporcionado."
        
        # Prompt del sistema: usar el personalizado si se proporciona, si no usar el predeterminado
        system_prompt = prompt if prompt else (
            "Eres un generador educativo IA. "
            "Responde SOLAMENTE con un JSON válido que siga exactamente "
            "este formato: {\"nota\": {\"titulo\": string, \"contenido\": string, \"resumen\": string, "
            "\"puntos_clave\": [string,...]}, "
            "\"cuestionarios\": [{\"titulo\": string, \"descripcion\": string, "
            "\"preguntas\": [{\"tipo\": \"seleccion_multiple\" | \"falso_verdadero\", "
            "\"contenido\": string, \"opciones\": [{\"contenido\": string, \"es_correcta\": boolean}, ...]}]}]}"
        )
        
        # Si el prompt contiene placeholders, reemplazarlos para hacerlo adaptativo al tema
        if prompt and ("{tema}" in prompt or "{contexto}" in prompt):
            system_prompt = system_prompt.replace("{tema}", tema).replace("{contexto}", contexto_texto)
        
        # Prompt del usuario: siempre incluye el tema y contexto específicos
        user_prompt = (
            f"Genera una nota completa sobre el siguiente tema y devuelve el JSON solicitado. "
            f"Tema: {tema}. "
            f"Contexto adicional: {contexto_texto} "
            "Incluye al menos un cuestionario con 3 preguntas de selección múltiple."
        )

        response = await self.client.chat.completions.create(
            model="sonar",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            temperature=0.7,
            max_tokens=4000  # Aumentado para manejar respuestas más largas
        )

        raw_content = (response.choices[0].message.content or "").strip()
        
        # Log para debugging (solo primeros 500 caracteres)
        if not raw_content:
            raise ValueError("La IA no devolvió ningún contenido")
        
        # Intentar parsear el JSON
        parsed = self._parse_json_response(raw_content)
        if parsed is None:
            # Si falla, intentar extraer JSON de manera más agresiva
            error_msg = f"La IA no devolvió un JSON válido. Respuesta recibida (primeros 500 chars): {raw_content[:500]}"
            raise ValueError(error_msg)

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
        cleaned = payload.strip()
        
        # 1. Intentar encontrar JSON en bloques de código markdown
        code_block_pattern = r"```(?:json)?\s*(\{.*?\})\s*```"
        code_blocks = re.findall(code_block_pattern, cleaned, re.DOTALL)
        candidates.extend(code_blocks)
        
        # 2. Si el payload empieza directamente con {, intentar parsearlo completo
        if cleaned.startswith('{'):
            candidates.append(cleaned)
        
        # 3. Buscar el primer { y encontrar su } correspondiente contando brackets
        first_brace = cleaned.find('{')
        if first_brace != -1:
            brace_count = 0
            start_pos = first_brace
            for i in range(first_brace, len(cleaned)):
                if cleaned[i] == '{':
                    brace_count += 1
                elif cleaned[i] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        json_candidate = cleaned[start_pos:i+1]
                        if json_candidate not in candidates:
                            candidates.append(json_candidate)
                        break
        
        # 4. Si no encontramos nada, buscar cualquier { ... } balanceado
        if not candidates:
            # Buscar desde el final hacia atrás
            last_brace = cleaned.rfind('}')
            if last_brace != -1:
                brace_count = 0
                for i in range(last_brace, -1, -1):
                    if cleaned[i] == '}':
                        brace_count += 1
                    elif cleaned[i] == '{':
                        brace_count -= 1
                        if brace_count == 0:
                            json_candidate = cleaned[i:last_brace+1]
                            if json_candidate not in candidates:
                                candidates.append(json_candidate)
                            break

        # Intentar parsear cada candidato
        for candidate in candidates:
            try:
                # Limpiar el candidato
                candidate_clean = candidate.strip()
                
                # Remover trailing commas problemáticas
                candidate_clean = re.sub(r',(\s*[}\]])', r'\1', candidate_clean)
                
                # Remover newlines problemáticos dentro de strings (pero mantener estructura)
                # Esto es tricky, mejor intentar parsear directamente
                
                parsed = json.loads(candidate_clean)
                
                # Validar estructura básica
                if isinstance(parsed, dict):
                    # Si tiene 'nota' o 'cuestionarios', es válido
                    if 'nota' in parsed or 'cuestionarios' in parsed:
                        return parsed
                    # Si es un dict vacío o con estructura diferente, continuar
                    
            except json.JSONDecodeError:
                # Si falla, intentar limpiar más agresivamente
                try:
                    # Intentar remover texto antes del primer {
                    candidate_clean = re.sub(r'^[^{]*', '', candidate)
                    # Intentar remover texto después del último }
                    candidate_clean = re.sub(r'[^}]*$', '', candidate_clean)
                    # Remover trailing commas
                    candidate_clean = re.sub(r',(\s*[}\]])', r'\1', candidate_clean)
                    
                    parsed = json.loads(candidate_clean)
                    if isinstance(parsed, dict) and ('nota' in parsed or 'cuestionarios' in parsed):
                        return parsed
                except:
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
