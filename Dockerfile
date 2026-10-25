# ==========================================
# Multi-Stage Dockerfile for Hugging Face Spaces
# 100% Free • 2 vCPU + 16GB RAM • Persistent HTTPS
# ==========================================

# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Python FastAPI backend
FROM python:3.11-slim

# Create non-root user (Hugging Face Spaces standard UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PORT=7860

WORKDIR $HOME/app

# Install Python dependencies
COPY --chown=user:user backend/requirements.txt ./
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy backend source code
COPY --chown=user:user backend/ ./

# Copy built React static frontend from Stage 1 into backend's dist folder
COPY --from=frontend-builder --chown=user:user /app/frontend/dist ./dist

# Hugging Face Spaces exposes port 7860
EXPOSE 7860

# Launch server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
