# 🚀 Deploying CloudOptima to Hugging Face Spaces (100% Free)
### 2 vCPU • 16GB RAM • Persistent HTTPS • No Credit Card Required

Hugging Face Spaces gives you a full Docker container with **16GB of RAM** and a persistent public HTTPS URL for **$0 / month forever**.

---

## 📋 Step-by-Step Deployment (Takes 3 Minutes)

### Step 1: Create a New Space on Hugging Face
1. Go to **[huggingface.co/new-space](https://huggingface.co/new-space)** (create a free account if you don't have one).
2. Fill in:
   - **Space name**: `cloudoptima` (or any name you like)
   - **License**: `MIT` or `Apache 2.0`
   - **Select the Space SDK**: Choose **Docker** 🐳
   - **Docker template**: Choose **Blank**
   - **Space Hardware**: Choose **Free - 2 vCPU · 16GB RAM**
   - **Visibility**: Choose **Public** (or Private)
3. Click **"Create Space"**.

---

### Step 2: Push CloudOptima Code to Your Space

Hugging Face will show you your Space's git clone URL (e.g. `https://huggingface.co/spaces/YOUR_USERNAME/cloudoptima`).

Run these commands on your computer:
```bash
# 1. Enter the cloudoptima folder
cd c:\Users\Prateek\Desktop\Hyperzod\Hyperzod_repositories\cloudoptima

# 2. Initialize git if not already done
git init
git add .
git commit -m "Deploy CloudOptima to Hugging Face Spaces"

# 3. Add your Hugging Face Space as remote
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/cloudoptima

# 4. Push code (you can use your Hugging Face Access Token as password)
git push -u hf main --force
```

*(Tip: You can get your Access Token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)).*

---

### Step 3: Add Your Gemini API Key as a Secret
1. In your Hugging Face Space, click **Settings** (gear icon) ➔ **Variables and secrets**.
2. Under **Secrets**, click **"New secret"**:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Google Gemini API Key (from [aistudio.google.com](https://aistudio.google.com/))
3. Click **Save**.

---

### Step 4: Your App is Live! 🎉
Hugging Face will automatically build the Docker container:
- Builds the clean Apple-style React frontend.
- Installs Python FastAPI and Boto3.
- Starts the server on port `7860`.

Your live SaaS will be accessible 24/7 at:
```
https://YOUR_USERNAME-cloudoptima.hf.space
```

Anyone with the link can open your app, view the cost optimization dashboard, connect their AWS account, and chat with your **Gemini 1.5 Pro AI Copilot**!
