const express = require('express');
const router = express.Router();

const UserService = require('../services/userService');
const JWTUtils = require('../utils/jwt');
const PasswordUtils = require('../utils/password');
const { authenticateRefreshToken } = require('../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate request body
        if (!email || !password) {
            return res.status(400).json({
                error: true,
                message: "Request body incomplete, both email and password are required"
            });
        }

        const emailValidation = PasswordUtils.validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                error: true,
                message: emailValidation.errors.join(', ')
            });
        }

        const passwordValidation = PasswordUtils.validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                error: true,
                message: passwordValidation.errors.join(', ')
            });
        }

        const user = await UserService.createUser(email, password);

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user.id,
                email: user.email
            }
        });

    } catch (error) {
        if (error.message.includes('already exists')) {
            return res.status(409).json({
                error: true,
                message: "User already exists"
            });
        }

        console.error('Registration error:', error);
        res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password, bearerExpiresInSeconds, refreshExpiresInSeconds } = req.body;

        // Validate request body
        if (!email || !password) {
            return res.status(400).json({
                error: true,
                message: "Request body incomplete, both email and password are required"
            });
        }

        // Authenticate user
        const user = await UserService.authenticateUser(email, password);

        // Generate tokens with custom expiry if provided
        const bearerExpiry = bearerExpiresInSeconds || parseInt(process.env.JWT_EXPIRES_IN) || 600;
        const refreshExpiry = refreshExpiresInSeconds || parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) || 86400;

        const tokenPayload = {
            id: user.id,
            email: user.email
        };

        const bearerToken = JWTUtils.generateAccessToken(tokenPayload, bearerExpiry);
        const refreshToken = JWTUtils.generateRefreshToken(tokenPayload, refreshExpiry);

        // Store refresh token in database
        const refreshExpiresAt = JWTUtils.getExpirationDate(refreshExpiry);
        await UserService.storeRefreshToken(refreshToken, user.id, refreshExpiresAt);

        res.json({
            bearerToken: {
                token: bearerToken,
                token_type: "Bearer",
                expires_in: bearerExpiry
            },
            refreshToken: {
                token: refreshToken,
                token_type: "Refresh",
                expires_in: refreshExpiry
            }
        });

    } catch (error) {
        if (error.message === 'Invalid email or password') {
            return res.status(401).json({
                error: true,
                message: "Invalid email or password"
            });
        }

        console.error('Login error:', error);
        res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

router.post('/refresh', authenticateRefreshToken, async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const user = req.user; // Set by authenticateRefreshToken middleware

        // Check if refresh token exists in th database
        const storedToken = await UserService.findRefreshToken(refreshToken);
        if (!storedToken) {
            return res.status(401).json({
                error: true,
                message: "Invalid refresh token"
            });
        }

        const tokenPayload = {
            id: user.id,
            email: user.email
        };

        const bearerExpiry = parseInt(process.env.JWT_EXPIRES_IN) || 600;
        const newBearerToken = JWTUtils.generateAccessToken(tokenPayload, bearerExpiry);

        res.json({
            bearerToken: {
                token: newBearerToken,
                token_type: "Bearer",
                expires_in: bearerExpiry
            }
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                error: true,
                message: "Request body incomplete, refresh token required"
            });
        }

        try {
            const decoded = JWTUtils.verifyToken(refreshToken);
            if (decoded.type !== 'refresh') {
                return res.status(400).json({
                    error: true,
                    message: "Invalid token type"
                });
            }
        } catch (error) {
            console.log('Token verification failed during logout:', error.message);
        }

        await UserService.deleteRefreshToken(refreshToken);

        res.json({
            message: "Token successfully invalidated"
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

module.exports = router;