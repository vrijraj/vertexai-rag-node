/**
 * Simple RAG Demo - Two Main Functions
 * 1. createEmbeddings() - Process PDF and create embeddings (run once)
 * 2. getAnswer(question) - Ask questions using RAG
 */

import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import pdf from "pdf-parse-debugging-disabled";

dotenv.config();

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION,
});

/**
 * 1️⃣ CREATE EMBEDDINGS - Run this once to process your PDF
 */
async function createEmbeddings() {
  console.log("🚀 Creating embeddings from PDF...");

  try {
    // Step 1: Read PDF
    const pdfBuffer = fs.readFileSync("./resume.pdf");
    const pdfData = await pdf(pdfBuffer);
    console.log(`📄 Extracted ${pdfData.text.length} characters from PDF`);

    // Step 2: Split text into chunks
    const chunks = [];
    const chunkSize = 1000;
    for (let i = 0; i < pdfData.text.length; i += chunkSize) {
      chunks.push(pdfData.text.slice(i, i + chunkSize));
    }
    console.log(`📝 Created ${chunks.length} text chunks`);

    // Step 3: Generate embeddings for each chunk
    const embeddings = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`🔄 Processing chunk ${i + 1}/${chunks.length}`);

      const response = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: chunks[i],
      });

      embeddings.push({
        text: chunks[i],
        embedding: response.embeddings[0].values,
      });

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Step 4: Save embeddings to file
    fs.writeFileSync("embeddings.json", JSON.stringify(embeddings, null, 2));
    console.log("✅ Embeddings created and saved to embeddings.json");
  } catch (error) {
    console.error("❌ Error creating embeddings:", error.message);
  }
}

/**
 * 2️⃣ GET ANSWER - Ask questions using the embeddings
 */
async function getAnswer(question) {
  console.log(`🤔 Question: ${question}`);

  try {
    // Step 1: Load embeddings
    if (!fs.existsSync("embeddings.json")) {
      return "❌ No embeddings found! Please run createEmbeddings() first.";
    }

    const embeddings = JSON.parse(fs.readFileSync("embeddings.json", "utf8"));
    console.log(`📚 Loaded ${embeddings.length} embeddings`);

    // Step 2: Get embedding for the question
    const questionResponse = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: question,
    });
    const questionEmbedding = questionResponse.embeddings[0].values;

    // Step 3: Find most similar chunks
    const similarities = embeddings.map((item) => {
      // Calculate cosine similarity
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;

      for (let i = 0; i < questionEmbedding.length; i++) {
        dotProduct += questionEmbedding[i] * item.embedding[i];
        normA += questionEmbedding[i] * questionEmbedding[i];
        normB += item.embedding[i] * item.embedding[i];
      }

      const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));

      return {
        text: item.text,
        similarity: similarity,
      };
    });

    // Step 4: Get top 3 most relevant chunks
    const topChunks = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    console.log("🔍 Most relevant chunks found:");
    topChunks.forEach((chunk, i) => {
      console.log(`  ${i + 1}. Similarity: ${chunk.similarity.toFixed(3)}`);
    });

    // Step 5: Create context from top chunks
    const context = topChunks.map((chunk) => chunk.text).join("\n\n");

    // Step 6: Generate answer using context
    const prompt = `Based on this context from the document, answer the question:

Context:
${context}

Question: ${question}

Answer:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    console.log("✅ Answer generated!");
    return response.text;
  } catch (error) {
    console.error("❌ Error getting answer:", error.message);
    return "Sorry, I couldn't generate an answer due to an error.";
  }
}

// 🎯 DEMO USAGE
async function demo() {
  console.log("=" * 50);
  console.log("🎯 RAG DEMO - Two Simple Functions");
  console.log("=" * 50);

  // Check if embeddings exist
  if (!fs.existsSync("embeddings.json")) {
    console.log("\n1️⃣ First time setup - Creating embeddings...");
    await createEmbeddings();
  } else {
    console.log("\n✅ Embeddings already exist, skipping creation");
  }

  console.log("\n2️⃣ Now asking questions...");

  // Ask some questions
  const questions = ["Tell me about John W. Smith"];

  for (const question of questions) {
    console.log("\n" + "-".repeat(40));
    const answer = await getAnswer(question);
    console.log(`💡 Answer: ${answer}`);
  }
}

// Run demo
demo();
