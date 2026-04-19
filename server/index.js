import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { Queue } from 'bullmq';
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();
const app = express();
const port = 8000;

const llm = new ChatGoogleGenerativeAI({ model: 'gemini-2.5-flash', apiKey: process.env.GOOGLE_API_KEY });

const queue = new Queue('file-upload-queue', {
    connection: {
        host: 'localhost',
        port: 6379
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `${uniqueSuffix}-${file.originalname}`)
    }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

// Upload Route.
app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No PDF file provided' });
        }
        await queue.add('file-ready', {
            filename: req.file.originalname,
            destination: req.file.destination,
            path: req.file.path
        });
        return res.json({ success: true, message: 'File uploaded successfully and queued for processing' });
    } catch (error) {
        console.error('Upload failed:', error);
        return res.status(500).json({ success: false, message: 'Upload failed' });
    }
});

// Chat Route — POST with body.
app.post('/chat', async (req, res) => {
    try {
        const { message: userQuery } = req.body;

        if (!userQuery || !userQuery.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        console.log(`Received message: ${userQuery}`);

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

        const retriever = vectorStore.asRetriever({ k: 5 });
        const result = await retriever.invoke(userQuery);
        console.log(`Retrieved ${result.length} docs`);

        const SYSTEM_PROMPT = `You are a helpful AI Assistant who answers the user's query based on the available context from a PDF file.
        You have to understand the user query smarty and reply with the given context.
        Context:
        ${JSON.stringify(result.map(doc => doc.pageContent))}`;

        const chatResult = await llm.invoke([
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userQuery }
        ]);

        return res.json({
            message: chatResult.content,
            docs: result
        });
    } catch (error) {
        console.error('Chat failed:', error.message);
        return res.status(500).json({ success: false, message: 'Chat processing failed' });
    }
});

app.get('/', (req, res) => {
    res.send('RAG PDF Chatbot Server is running!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});