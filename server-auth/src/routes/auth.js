import express from 'express';
import { body, validationResult } from 'express-validator';
import { getUserByEmail, createUser, saveRefreshToken, findRefreshToken, removeRefreshToken, saveResetToken, findResetToken, removeResetToken, getUserById, updateUser, getPublicGroups, verifyPassword } from '../utils/database.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, verifyAccessToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';
import { sendResetPasswordEmail, sendWelcomeEmail, sendPasswordChangeSuccessEmail } from '../utils/mailer.js';
import crypto from 'crypto';

const router = express.Router();

// Register
router.post('/register',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('groupId').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array(), error: 'Validation failed: ' + errors.array().map(e => e.msg).join(', ') });
        }

        try {
            const { email, password, name, groupId, position } = req.body;

            const existingUser = await getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const user = await createUser({ email, password, name, groupId, position });

            try {
                await sendWelcomeEmail(email, name);
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            saveRefreshToken(refreshToken, user.id);

            // Set tokens in HTTP-only cookies
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: false, // set to true in production with HTTPS
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.status(201).json({
                message: 'User registered successfully',
                response: {
                    token: accessToken,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        groupId: user.groupId,
                        position: user.position,
                        role: user.role
                    }
                }
            });
        } catch (error) {
            console.error('❌ Registration error:', error);
            console.error('Stack trace:', error.stack);
            res.status(500).json({ error: 'Registration failed', details: error.message });
        }
    }
);

// Login
router.post('/login',
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, password } = req.body;

            const user = await getUserByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const isValidPassword = verifyPassword(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            saveRefreshToken(refreshToken, user.id);

            // Set tokens in HTTP-only cookies
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: false, // set to true in production with HTTPS
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({
                message: 'Login successful',
                response: {
                    token: accessToken,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Login failed' });
        }
    }
);

// Refresh token
router.post('/refreshToken',
    authenticate,
    async (req, res) => {
        try {
            const user = req.user;

            const newAccessToken = generateAccessToken(user);

            res.json({
                response: {
                    token: newAccessToken
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Token refresh failed' });
        }
    }
);

// Logout
router.post('/logout',
    body('refreshToken').notEmpty(),
    (req, res) => {
        try {
            const { refreshToken } = req.body;
            removeRefreshToken(refreshToken);
            res.json({ message: 'Logout successful' });
        } catch (error) {
            res.status(500).json({ error: 'Logout failed' });
        }
    }
);

// Verify token
router.get('/verify', authenticate, (req, res) => {
    res.json({
        valid: true,
        user: req.user
    });
});

// Request Reset Password
router.post('/requestReset',
    body('email').isEmail().normalizeEmail(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email } = req.body;

            const user = await getUserByEmail(email);
            if (!user) {
                // Don't reveal if user exists
                return res.json({ message: 'If the email exists, a reset link has been sent' });
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            saveResetToken(resetToken, user.id);

            // Create reset URL pointing to server-auth reset-password route with token and user id
            const resetUrl = `${process.env.AUTH_URL}/reset-password?token=${resetToken}&id=${user.id}`;

            try {
                await sendResetPasswordEmail(email, resetToken, resetUrl);
            } catch (emailError) {
                console.error('Failed to send reset password email:', emailError);
            }

            res.json({
                message: 'If the email exists, a reset link has been sent'
            });
        } catch (error) {
            console.error('Reset request error:', error);
            res.status(500).json({ error: 'Reset request failed' });
        }
    }
);

// Reset Password
router.post('/resetPassword',
    body('token').notEmpty(),
    body('id').isUUID(),
    body('password').isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { token, id, password } = req.body;

            const resetToken = findResetToken(token);
            if (!resetToken || resetToken.userId !== id) {
                return res.status(400).json({ error: 'Invalid or expired reset token' });
            }

            const user = await getUserById(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            await updateUser(id, { password });
            removeResetToken(token);
            try {
                await sendPasswordChangeSuccessEmail(user.email);
            } catch (emailError) {
                console.error('Failed to send password change success email:', emailError);
            }

            res.json({ message: 'Password reset successful' });
        } catch (error) {
            res.status(500).json({ error: 'Password reset failed' });
        }
    }
);

// Get public groups
router.get('/groups', async (req, res) => {
    try {
        const groups = await getPublicGroups();
        res.json({
            response: {
                data: groups
            }
        });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

export default router;
