import 'dotenv/config';
import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const worker = new Worker('file-upload-queue', async (job) => {
    const data = job.data;
    console.log('Processing job:', data.filename);

    /*
    Pipeline:
    1. Load PDF from disk
    2. Split into chunks
    3. Embed chunks via Gemini
    4. Store in Qdrant vector DB
    */

    // Step 1: Load PDF
    const loader = new PDFLoader(data.path);
    const docs = await loader.load();
    console.log(`Loaded ${docs.length} pages from ${data.filename}`);

    // Step 2: Chunk the documents
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const chunks = await splitter.splitDocuments(docs);
    console.log(`Split into ${chunks.length} chunks`);

    // Step 3 & 4: Embed and store in Qdrant
    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: 'gemini-embedding-001',
        apiKey: process.env.GOOGLE_API_KEY,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
            url: process.env.QDRANT_URL,
            collectionName: 'langchainjs-testing',
        }
    );

    await vectorStore.addDocuments(chunks);
    console.log(`✅ ${chunks.length} chunks embedded and stored for "${data.filename}"`);

}, {
    concurrency: 5,
    connection: {
        host: 'localhost',
        port: 6379
    }
});

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
});