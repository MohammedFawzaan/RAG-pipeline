import express from 'express';
import { chatController } from '../controller/chat.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const chatRouter = express.Router();

// Chat Route — POST with body.
chatRouter.post('/', authMiddleware, chatController);

export default chatRouter;