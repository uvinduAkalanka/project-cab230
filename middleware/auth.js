const JWTUtils = require('../utils/jwt');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({
            error: true,
            message: "Authorization header ('Bearer token') not found"
        });
    }

    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
        return res.status(401).json({
            error: true,
            message: "Authorization header is malformed"
        });
    }

    try {
        const decoded = JWTUtils.verifyToken(token);

        if (decoded.type !== 'access') {
            return res.status(401).json({
                error: true,
                message: "Invalid token type"
            });
        }

        req.user = {
            id: decoded.id,
            email: decoded.email
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: true,
                message: "JWT token has expired"
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: true,
                message: "Invalid JWT token"
            });
        } else {
            return res.status(500).json({
                error: true,
                message: "Token verification failed"
            });
        }
    }
};


const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        req.user = null;
        return next();
    }

    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
        return res.status(401).json({
            error: true,
            message: "Authorization header is malformed"
        });
    }

    try {
        const decoded = JWTUtils.verifyToken(token);

        // Ensure it's an access token
        if (decoded.type !== 'access') {
            return res.status(401).json({
                error: true,
                message: "Invalid token type"
            });
        }

        req.user = {
            id: decoded.id,
            email: decoded.email
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: true,
                message: "JWT token has expired"
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: true,
                message: "Invalid JWT token"
            });
        } else {
            return res.status(500).json({
                error: true,
                message: "Token verification failed"
            });
        }
    }
};

const authenticateRefreshToken = (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({
            error: true,
            message: "Refresh token is required"
        });
    }

    try {
        const decoded = JWTUtils.verifyToken(refreshToken);

        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                error: true,
                message: "Invalid token type"
            });
        }

        req.user = {
            id: decoded.id,
            email: decoded.email,
            jti: decoded.jti
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: true,
                message: "Refresh token has expired"
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: true,
                message: "Invalid refresh token"
            });
        } else {
            return res.status(500).json({
                error: true,
                message: "Refresh token verification failed"
            });
        }
    }
};

module.exports = {
    authenticateToken,
    optionalAuth,
    authenticateRefreshToken
};