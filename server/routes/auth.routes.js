import express from 'express';
import passport from 'passport';
import { googleAuthCallback, logoutController, getMeController } from '../controller/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const authRouter = express.Router();

// Initiate Google OAuth
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
authRouter.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), googleAuthCallback);

// Get current user (protected)
authRouter.get('/me', authMiddleware, getMeController);

// Logout
authRouter.post('/logout', logoutController);

export default authRouter;