from fastapi import FastAPI
import requests
import os
from langchain_ollama import OllamaLLM
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_ollama import ChatOllama
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_ollama import OllamaEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

app = FastAPI()

# Configuration - make Ollama URL configurable
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_API_URL = f"{OLLAMA_BASE_URL}/api"

def load_pdf(pdf_path: str):
    loader = PyPDFLoader(file_path=pdf_path)
    data = loader.load()
    print("done loading....")
    return data

def split_pdf(data: list):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=300)
    chunks = text_splitter.split_documents(data)
    print("done splitting....")
    return chunks

def create_vector_db(chunks: list):
    vector_db = Chroma.from_documents(
        documents=chunks,
        embedding=OllamaEmbeddings(model="nomic-embed-text", base_url=OLLAMA_BASE_URL),
        collection_name="devops-rag",
    )
    return vector_db


@app.get("/")
def health_checkt():
    return {"message": "Server is running!", "ollama_url": OLLAMA_BASE_URL}

@app.get("/models")
def get_models():
    try:
        response = requests.get(f"{OLLAMA_API_URL}/tags")
        response.raise_for_status()
        models = response.json()
        models_list = []
        for model in models['models']:
          print(f"Model: {model['name']} (Size: {model['size']})")
          models_list.append(model['name'])
        return models_list
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to connect to Ollama at {OLLAMA_BASE_URL}: {str(e)}"}

@app.get("/model_response")
def get_model_response(model_name: str, question: str):
    try:
        llm = ChatOllama(model=model_name, base_url=OLLAMA_BASE_URL)
        doc_path = "./data/DevOpsknowledgebase.pdf"
        data = load_pdf(doc_path)
        chunks = split_pdf(data)
        vector_db = create_vector_db(chunks)
        
        retriever = MultiQueryRetriever.from_llm(
            vector_db.as_retriever(), llm
        )
        
        # Create a proper prompt template
        prompt = ChatPromptTemplate.from_template("""
        Based on the following context, please answer the question:
        
        Context: {context}
        
        Question: {question}
        
        Answer:
        """)
        
        # Function to format retrieved documents
        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)
        
        # Create the proper chain
        chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
        
        response = chain.invoke(question)
        return {"answer": response}
    except Exception as e:
        return {"error": f"Failed to process request: {str(e)}"}
