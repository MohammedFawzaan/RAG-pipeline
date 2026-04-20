import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const chatController = async (req, res) => {
    try {
        const llm = new ChatGoogleGenerativeAI({ model: 'gemini-2.5-flash', apiKey: process.env.GOOGLE_API_KEY });
        const { message: userQuery, documentId } = req.body;
        const userId = req.user.googleId;

        if (!userQuery?.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }
        if (!documentId) {
            return res.status(400).json({ success: false, message: 'No document selected. Please upload and select a PDF first.' });
        }

        console.log(`Chat [user: ${userId}, doc: ${documentId}]: ${userQuery}`);

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

        // Filtered similarity search — only chunks from this user's specific document
        const similarDocs = await vectorStore.similaritySearch(userQuery, 10);
        
        // Post-filter results by userId and documentId
        const docs = similarDocs.filter(doc => 
            doc.metadata?.userId === userId && doc.metadata?.documentId === documentId
        );

        console.log(`Retrieved ${docs.length} docs`);

        const SYSTEM_PROMPT = `You are a helpful AI Assistant who answers the user's query based on the available context from a PDF file.
        Understand the user query and reply smartly using only the given context.
        IMPORTANT: Your response must be in clean, readable plain text. DO NOT use any Markdown formatting like **, *, or #. Use standard spaces, line breaks, and numbering for structure.
        Context:
        ${docs.map(doc => doc.pageContent).join('\n\n')}`;

        const chatResult = await llm.invoke([
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userQuery },
        ]);

        return res.json({
            success: true,
            message: chatResult.content,
            docs,
        });
    } catch (error) {
        console.error('Chat failed:', error.message);
        return res.status(500).json({ success: false, message: 'Chat processing failed: ' + error.message });
    }
};