import 'dotenv/config';
import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const worker = new Worker('file-upload-queue', async (job) => {
    const { fileName, path, userId, documentId } = job.data;
    console.log('Processing job:', fileName);

    /*
    Pipeline:
    1. Load PDF from disk
    2. Split into chunks
    3. Inject userId + documentId into every chunk's metadata
    4. Embed chunks via Gemini
    5. Store in single Qdrant collection
    */

    // Step 1: Load PDF
    const loader = new PDFLoader(path);
    const docs = await loader.load();
    console.log(`Loaded ${docs.length} pages from ${fileName}`);

    // Step 2: Chunk the documents
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const chunks = await splitter.splitDocuments(docs);
    console.log(`Split into ${chunks.length} chunks`);

    // Step 3: Tag every chunk with userId + documentId + fileName for filtered retrieval
    const taggedChunks = chunks.map(chunk => ({
        ...chunk,
        metadata: {
            ...chunk.metadata,
            userId,
            documentId,
            fileName,
        },
    }));

    // Step 4 & 5: Embed and store in Qdrant (single shared collection)
    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: 'gemini-embedding-001',
        apiKey: process.env.GOOGLE_API_KEY,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY,
            collectionName: 'ragbot-docs',
        }
    );

    await vectorStore.addDocuments(taggedChunks);
    console.log(`✅ ${taggedChunks.length} chunks embedded and stored for "${fileName}" [user: ${userId}, doc: ${documentId}]`);

}, {
    concurrency: 5,
    // connection: { host: 'localhost', port: 6379 },
    connection: {
        host: process.env.UPSTASH_REDIS_REST_URL?.replace('https://', ''),
        port: Number(process.env.UPSTASH_REDIS_REST_PORT) || 6379,
        password: process.env.UPSTASH_REDIS_REST_TOKEN,
        tls: {}, // Required for Upstash
    },
});

worker.on('completed', (job) =>
    console.log(`Job ${job.id} completed`)
);

worker.on('failed', (job, err) =>
    console.error(`Job ${job?.id} failed:`, err.message)
);
