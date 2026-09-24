import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add the parent directory to sys.path so we can import the existing pipeline
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.schemas import ResearchRequest, ResearchResponse
from pipeline import run_search_pipeline

# Monkey-patch sys.stdout to prevent UnicodeEncodeError on Windows during prints in pipeline.py
import io
try:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
except AttributeError:
    pass

app = FastAPI(title="INQUIRA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/research", response_model=ResearchResponse)
def research(request: ResearchRequest):
    try:
        # Pass the question to the EXISTING research pipeline
        # Using a synchronous def here allows FastAPI to run this blocking code in a threadpool
        state = run_search_pipeline(request.question)
        
        return ResearchResponse(
            success=True,
            question=request.question,
            result=state
        )
    except Exception as e:
        # Return a clean JSON structure on error without exposing stack traces
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Research pipeline failed: " + str(e)
            }
        )
