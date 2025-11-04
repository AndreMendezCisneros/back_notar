from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routes import generation  # Importa las rutas

load_dotenv()

app = FastAPI(
    title="NotAr IA Service",
    description="Microservicio de IA para generación de notas",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir el router
app.include_router(generation.router, prefix="/api/v1", tags=["IA"])

@app.get("/")
def read_root():
    return {"message": "NotAr IA Service", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
