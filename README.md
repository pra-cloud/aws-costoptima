# CloudOptima ☁️⚡
### AI-Powered AWS Cloud Cost & Waste Optimization SaaS

Reverse-engineered from market leaders **Vantage.sh**, **Cast.ai**, **Pump.co**, and **CloudZero**.

CloudOptima connects to any AWS account in 60 seconds with **Zero-Risk Read-Only IAM permissions**, scans the entire cloud footprint across 6 waste categories, and delivers executive ROI scorecards with **1-Click AI-generated AWS CLI & Terraform remediation scripts**.

---

## 🚀 Key Features

### 1. 🔍 Automated Cloud Waste Scanners
- **Oversized & Idle EC2 Rightsizing**: Evaluates 14-day CloudWatch P95 CPU & I/O to safely downsize instances (e.g. `c5.2xlarge` $\rightarrow$ `t3.large`, saving ~$184/mo per instance).
- **Zombie Unattached EBS Volumes**: Catches orphaned volumes left behind after instance termination ($0.10/GB-month accumulating continuously).
- **GP2 $\rightarrow$ GP3 Modernization**: Automated upgrade recommendation yielding instant 20% storage cost reduction with 0 downtime.
- **Idle Elastic IPs (EIPs)**: Finds unattached public IPs incurring AWS's $0.005/hr penalty fee.
- **NAT Gateway Traffic Leakage**: Identifies unrouted S3 traffic flowing through NAT Gateways ($0.045/GB) and recommends free S3 Gateway VPC Endpoints.
- **Development Multi-AZ Databases**: Flags non-production RDS instances running expensive Multi-AZ standbys.
- **S3 Intelligent-Tiering Auditor**: Recommends lifecycle policies to tier cold objects after 30/90 days.

### 2. 🤖 AI FinOps Copilot
- Synthesizes complex telemetry into clear executive English for CTOs and Finance leaders.
- Evaluates risk trade-offs (`100% Safe`, `Zero Downtime`, `Requires Maintenance Window`).
- Interactive chat copilot generates instant **AWS CLI commands** and **Terraform code snippets**.

### 3. 🔐 Enterprise 1-Click AWS Onboarding
- Uses **AWS Cross-Account IAM Roles with `ExternalId`** to prevent Confused Deputy exploits.
- Accompanied by a 1-click **CloudFormation Template** (`templates/cloudformation.yaml`).
- **100% Read-Only**: Attached to AWS's official `SecurityAudit` managed policy.

---

## 📁 Project Structure

```
cloudoptima/
├── backend/
│   ├── main.py                     # FastAPI REST API & Session router
│   ├── requirements.txt            # Python dependencies (fastapi, boto3, uvicorn)
│   ├── services/
│   │   ├── aws_scanner.py          # Boto3 scanner & realistic demo telemetry generator
│   │   └── ai_copilot.py           # AI FinOps reasoning & chat engine
│   └── templates/
│       └── cloudformation.yaml     # 1-Click AWS IAM Cross-Account Stack
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── App.jsx                 # Executive Dashboard & AI Copilot interface
    │   ├── components/
    │   │   ├── Header.jsx          # Account status & Connect button
    │   │   ├── MetricCards.jsx     # Spend, Savings ($ & %), Efficiency score
    │   │   ├── SavingsBreakdown.jsx# Visual category bars (EC2, EBS, RDS, S3, Net)
    │   │   ├── WasteTable.jsx      # Filterable detected waste findings
    │   │   ├── AiCopilotModal.jsx  # 1-click CLI & Terraform remediation modal
    │   │   └── ConnectAwsModal.jsx # CloudFormation, IAM Keys & Demo modes
    │   └── index.css
```

---

## 🏃 Quick Start Guide

### Step 1: Launch Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # On Windows
pip install -r requirements.txt
uvicorn main:app --port 8001 --reload
```

### Step 2: Launch Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:3000`** in your browser!

---

## 💰 Monetization Models for your SaaS

1. **Percentage of Verified Savings (Pure Value Share - like Pump.co / ProsperOps)**:
   - Charge **15% to 25%** of the actual savings realized each month.
   - If CloudOptima saves a company $2,000/mo, you charge $400/mo. Zero risk for the client!
2. **Tiered Monthly SaaS Subscription**:
   - **Starter**: $49/mo (Up to $5k AWS spend, weekly scans)
   - **Growth**: $199/mo (Up to $25k AWS spend, daily scans, AI Copilot)
   - **Scale**: $499/mo (Multi-account, automated remediation, Slack alerts)
