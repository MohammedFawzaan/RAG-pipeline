import { Queue } from 'bullmq';
import { v4 as UUID } from 'uuid';

const queue = new Queue('file-upload-queue', {
    connection: {
        host: process.env.UPSTASH_REDIS_REST_URL?.replace('https://', ''),
        port: Number(process.env.UPSTASH_REDIS_REST_PORT),
        password: process.env.UPSTASH_REDIS_REST_TOKEN,
        tls: {},
    },
});

export const uploadFiles = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No PDF file provided' });
        }

        const userId = req.user.googleId;
        const documentId = UUID();
        const fileName = req.file.originalname;
        const uploadedAt = new Date().toISOString();

        await queue.add('file-ready', {
            userId,
            documentId,
            fileName,
            uploadedAt,
            destination: req.file.destination,
            path: req.file.path,
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

export const getFilesController = async (req, res) => {
    try {
        const userId = req.user.googleId;
        const headers = {
            'Content-Type': 'application/json',
            ...(process.env.QDRANT_API_KEY && { 'api-key': process.env.QDRANT_API_KEY }),
        };

        // Scroll Qdrant for all chunks belonging to this user, only metadata payload is needed (skip page_content and vectors).
        const response = await fetch(
            `${process.env.QDRANT_URL}/collections/ragbot-docs/points/scroll`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    filter: {
                        must: [{ key: 'metadata.userId', match: { value: userId } }],
                    },
                    limit: 1000,
                    with_payload: { include: ['metadata'] },
                    with_vector: false,
                }),
            }
        );

        if (!response.ok) throw new Error(`Qdrant scroll failed: ${response.status}`);

        const { result } = await response.json();
        const points = result?.points ?? [];

        // Deduplicate by documentId — one entry per document
        const seen = new Set();
        const files = [];
        for (const point of points) {
            const { documentId, fileName, uploadedAt } = point.payload?.metadata ?? {};
            if (documentId && !seen.has(documentId)) {
                seen.add(documentId);
                files.push({ documentId, fileName, uploadedAt: uploadedAt ?? null });
            }
        }

        // Newest first; docs without uploadedAt (uploaded before this fix) go to the end
        files.sort((a, b) => {
            if (!a.uploadedAt) return 1;
            if (!b.uploadedAt) return -1;
            return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        });

        return res.json({ success: true, files });
    } catch (error) {
        console.error('Get files failed:', error);
        return res.status(500).json({ success: false, message: 'Get files failed' });
    }
};
