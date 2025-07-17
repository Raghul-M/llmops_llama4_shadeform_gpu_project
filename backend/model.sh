#!/bin/bash

# Install Ollama if not installed
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
fi



# Pull models
ollama pull llama3.2:1b
ollama pull llama4:16x17b
ollama pull deepseek-llm:67b
ollama pull gemma3:27b
ollama pull nomic-embed-text:v1.5

# Start Ollama in background
ollama serve &

