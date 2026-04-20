import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import chatRouter from './routes/chat.routes.js';
import uploadRouter from './routes/upload.routes.js';
import authRouter from './routes/auth.routes.js';

dotenv.config();
const app = express();

// Important for deployment - reverse proxy.
app.set('trust proxy', 1);

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session (required for Passport OAuth handshake only)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth Strategy — DB-less (profile stored in JWT)
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CLIENT_CALLBACK,
}, (accessToken, refreshToken, profile, done) => {
    const user = {
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        avatar: profile.photos?.[0]?.value,
    };
    return done(null, user);
}));

// Serialize/Deserialize — store the full user object in the session (DB-less)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/upload', uploadRouter);

app.get('/', (req, res) => {
    res.send('RAG PDF Chatbot Server is running!');
});

export default app;