import jwt from "jsonwebtoken";

export const googleAuthCallback = (req, res) => {
    const user = req.user;
    const payload = { googleId: user.googleId, name: user.name, email: user.email, avatar: user.avatar };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3d' });
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${process.env.FRONTEND_URL}/chat`);
};

export const logoutController = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logout successful' });
};

export const getMeController = (req, res) => {
    // req.user is set by authMiddleware (decoded JWT)
    res.json({ success: true, user: req.user });
};