import express from 'express';
import { uploadFiles, getFilesController } from '../controller/upload.controller.js';
import { upload } from '../middlewares/multer.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const uploadRouter = express.Router();

// GET /api/upload/files — list user's uploaded documents
uploadRouter.get('/files', authMiddleware, getFilesController);

// POST /api/upload/pdf — upload and queue a PDF
uploadRouter.post('/pdf', authMiddleware, upload.single('pdf'), uploadFiles);

export default uploadRouter;