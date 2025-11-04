import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class PerplexityService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        print(f"DEBUG: API Key loaded: {api_key[:20] if api_key else 'NO ENCONTRADA'}")
        
        if not api_key:
            raise ValueError("OPENAI_API_KEY no está configurada")
        
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.perplexity.ai"
        )
    
    async def generate_nota(self, tema: str, contenido: str):
        try:
            print(f"DEBUG: Generando nota para tema: {tema}")
            
            response = self.client.chat.completions.create(
                model="sonar",
                messages=[
                    {
                        "role": "system", 
                        "content": "Eres un experto educativo. Genera una nota de estudio clara y estructurada."
                    },
                    {
                        "role": "user", 
                        "content": f"Crea una nota sobre: {tema}\n\nContenido: {contenido}"
                    }
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            resultado = response.choices[0].message.content
            print(f"DEBUG: Nota generada exitosamente")
            
            return {"nota": resultado, "cuestionario": []}
        except Exception as e:
            print(f"ERROR: {str(e)}")
            raise
    
    async def summarize(self, texto: str):
        try:
            print(f"DEBUG: Resumiendo texto...")
            
            response = self.client.chat.completions.create(
                model="sonar",
                messages=[
                    {"role": "system", "content": "Resume el siguiente texto de forma concisa."},
                    {"role": "user", "content": texto}
                ],
                temperature=0.5,
                max_tokens=500
            )
            
            return response.choices[0].message.content
        except Exception as e:
            print(f"ERROR: {str(e)}")
            raise
