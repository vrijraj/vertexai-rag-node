![RAGGCP](https://github.com/user-attachments/assets/d7431f9c-290e-48b5-9822-7b8fd7b6a804)
# Vertex AI RAG with Node

This project implements a Retrieval-Augmented Generation (RAG) system using Google's Vertex AI and Gemini models.

## How RAG Works

1. **Document Processing**: The PDF is chunked into smaller pieces (1000 characters each)
2. **Embedding Generation**: Each chunk is converted to a vector embedding using `text-embedding-004`
3. **Vector Storage**: Embeddings are stored in `embeddings.json` with their corresponding text
4. **Query Processing**: When you ask a question:
   - The question is converted to an embedding
   - Cosine similarity search finds the most relevant chunks
   - Top 3 most similar chunks are retrieved
   - Context is passed to Gemini 2.0 Flash to generate an answer

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Google Cloud authentication**:
   ```bash
   gcloud auth login
   ```

3. **Create `.env` file**:
   ```env
   GOOGLE_CLOUD_PROJECT=YOUR_GCP_PROJECT_ID
   GOOGLE_CLOUD_LOCATION=global
   ```

## Usage

### 1. Run the Demo

The simplest way to use the system is to run the demo:

```bash
node index.js
```

This will:
- Check if `embeddings.json` exists
- If not, process `grad.pdf` and create embeddings
- Ask a sample question about Stepwik founders
- Display the answer

### 2. Manual Usage

You can also use the functions directly:

```javascript
// Create embeddings (run once)
await createEmbeddings();

// Ask questions
const answer = await getAnswer("What is Stepwik?");
console.log(answer);
```

## Files

- `index.js` - Main RAG implementation with two functions:
  - `createEmbeddings()` - Processes PDF and creates embeddings
  - `getAnswer(question)` - Queries the RAG system
- `embeddings.json` - Stores embeddings and text chunks
- `grad.pdf` - Your source document

## Configuration

The system is configured for:
- **Project**: `agprop-in`
- **Location**: `global`
- **Embedding Model**: `text-embedding-004`
- **Generation Model**: `gemini-2.0-flash`
- **Chunk Size**: 1000 characters
- **Top Results**: 3 most similar chunks

## Example Output

```
🎯 RAG DEMO - Two Simple Functions
==================================================

✅ Embeddings already exist, skipping creation

2️⃣ Now asking questions...

----------------------------------------
🤔 Question: How are the founder of Stepwik?
📚 Loaded 15 embeddings
🔍 Most relevant chunks found:
  1. Similarity: 0.823
  2. Similarity: 0.712
  3. Similarity: 0.689
✅ Answer generated!
💡 Answer: Based on the context, the founders of Stepwik are...
```

## Key Features

- **Automatic Setup**: Checks for existing embeddings and creates them if needed
- **Cosine Similarity**: Uses mathematical similarity scoring for accurate retrieval
- **Rate Limiting**: Includes delays to avoid API rate limits
- **Error Handling**: Graceful error handling with informative messages
- **Context-Aware**: Provides relevant document context to the AI model

This ensures the model answers based on your specific document content rather than general knowledge. 
