import { Queue } from 'bullmq';
import { v4 as UUID } from 'uuid';

const queue = new Queue('file-upload-queue', {
    // connection: { host: 'localhost', port: 6379 },
    connection: {
        host: process.env.UPSTASH_REDIS_REST_URL?.replace('https://', ''),
        port: Number(process.env.UPSTASH_REDIS_REST_PORT) || 6379,
        password: process.env.UPSTASH_REDIS_REST_TOKEN,
        tls: {}, // Required for Upstash
    },
});

// In-memory file store: Map<userId, Array<{ documentId, fileName, uploadedAt }>>
const userFiles = new Map();

export const uploadFiles = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No PDF file provided' });
        }

        const userId = req.user.googleId;
        const documentId = UUID();
        const fileName = req.file.originalname;

        await queue.add('file-ready', {
            userId,
            documentId,
            fileName,
            destination: req.file.destination,
            path: req.file.path,
        });

        // Store file metadata in memory
        if (!userFiles.has(userId)) userFiles.set(userId, []);
        userFiles.get(userId).push({
            documentId,
            fileName,
            uploadedAt: new Date().toISOString(),
        });

        return res.json({
            success: true,
            message: 'File uploaded successfully and queued for processing',
            documentId,
            fileName,
        });
    } catch (error) {
        console.error('Upload failed:', error);
        return res.status(500).json({ success: false, message: 'Upload failed' });
    }
};

export const getFilesController = (req, res) => {
    try {
        const userId = req.user.googleId;
        const files = userFiles.get(userId) || [];
        return res.json({ success: true, files });
    } catch (error) {
        console.error('Get files failed:', error);
        return res.status(500).json({ success: false, message: 'Get files failed' });
    }
};