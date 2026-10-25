from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os

from services.aws_scanner import AwsCostScanner
from services.ai_copilot import AiCostCopilot

app = FastAPI(
    title="CloudOptima API",
    description="AI-Powered AWS Cost & Waste Optimization Engine",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory active session state
active_scanner = AwsCostScanner()  # Defaults to demo mode
ai_copilot = AiCostCopilot()
cached_scan_data: Optional[Dict[str, Any]] = None

class ConnectAccountRequest(BaseModel):
    role_arn: Optional[str] = None
    external_id: Optional[str] = None
    access_key: Optional[str] = None
    secret_key: Optional[str] = None
    region: str = "us-east-1"
    is_demo: bool = False

class ChatRequest(BaseModel):
    question: str

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "CloudOptima Engine", "version": "1.0.0"}

@app.get("/api/scan")
def get_scan():
    """
    Returns latest AWS cost & waste scan data.
    """
    global cached_scan_data, active_scanner
    if not cached_scan_data:
        cached_scan_data = active_scanner.scan_all()
    return cached_scan_data

@app.post("/api/scan/connect")
def connect_account(req: ConnectAccountRequest):
    """
    Connects a client's AWS account using IAM Cross-Account Role or Read-Only Keys.
    """
    global active_scanner, cached_scan_data
    try:
        if req.is_demo:
            active_scanner = AwsCostScanner()
        else:
            active_scanner = AwsCostScanner(
                role_arn=req.role_arn,
                external_id=req.external_id,
                access_key=req.access_key,
                secret_key=req.secret_key,
                region=req.region
            )
        cached_scan_data = active_scanner.scan_all()
        return {
            "status": "connected",
            "message": "AWS account connected and scanned successfully.",
            "data": cached_scan_data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/ai/analysis")
async def get_ai_analysis():
    """
    Generates AI executive FinOps report based on scanned cloud telemetry.
    """
    global cached_scan_data, active_scanner
    if not cached_scan_data:
        cached_scan_data = active_scanner.scan_all()
    
    analysis = await ai_copilot.generate_executive_analysis(cached_scan_data)
    return analysis

@app.post("/api/ai/chat")
async def chat_with_copilot(req: ChatRequest):
    """
    Interactive AI Copilot chat to advise on specific resources and remediation.
    """
    global cached_scan_data, active_scanner
    if not cached_scan_data:
        cached_scan_data = active_scanner.scan_all()

    reply = await ai_copilot.ask_copilot(req.question, cached_scan_data)
    return {"reply": reply}

@app.get("/api/cloudformation")
def get_cloudformation_template():
    """
    Returns the 1-Click CloudFormation YAML template string.
    """
    cf_path = os.path.join(os.path.dirname(__file__), "templates", "cloudformation.yaml")
    if os.path.exists(cf_path):
        with open(cf_path, "r") as f:
            content = f.read()
        return {"template": content}
    return {"error": "Template not found"}

# Serve built React frontend in production / Hugging Face Spaces
dist_dir = os.path.join(os.path.dirname(__file__), "dist")
if not os.path.exists(dist_dir):
    dist_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(dist_dir):
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
