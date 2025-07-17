# Simple FastAPI backend
FROM python:3.11-slim

WORKDIR /app

# Install curl for basic connectivity
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY . .
RUN pip install -r requirements.txt && chmod +x model.sh && ./model.sh

# Set Ollama URL environment variable (connect to ollama container)
ENV OLLAMA_BASE_URL=http://ollama:11434

# Run the app
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
